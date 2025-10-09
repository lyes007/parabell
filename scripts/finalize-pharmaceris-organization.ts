import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function finalizePharmacerisOrganization() {
  console.log('🔧 Finalizing Pharmaceris organization...')
  
  // Find Pharmaceris brand
  const pharmacerisBrand = await prisma.brand.findFirst({
    where: {
      name: {
        contains: 'Pharmaceris',
        mode: 'insensitive'
      }
    }
  })
  
  if (!pharmacerisBrand) {
    console.log('❌ Pharmaceris brand not found in database')
    return
  }
  
  // Find GAMME F category
  const gammeFCategory = await prisma.category.findFirst({
    where: {
      name: 'GAMME F - Fluid Fondation',
      brand_id: pharmacerisBrand.id
    }
  })
  
  if (!gammeFCategory) {
    console.log('❌ GAMME F category not found')
    return
  }
  
  // Move GAMME F products from GAMME S to GAMME F
  const gammeFProducts = [
    'Fluide protecteur et correcteur la plus haute protection spf 50+ – Correction solaire 02 Ivoire 30 ml',
    'Fluide protecteur-correctif haute protection spf 50+ – Correction solaire 01 Sable 30 ml'
  ]
  
  let movedCount = 0
  
  for (const productName of gammeFProducts) {
    const product = await prisma.product.findFirst({
      where: {
        name: productName,
        brand_id: pharmacerisBrand.id
      }
    })
    
    if (product) {
      await prisma.product.update({
        where: { id: product.id },
        data: { category_id: gammeFCategory.id }
      })
      console.log(`📝 Moved to GAMME F: ${productName}`)
      movedCount++
    }
  }
  
  // Remove duplicate products
  const duplicatesToRemove = [
    'Coup d\'éclat ,Hydratation et Prévention des Rides',
    'Coup d\'éclat Immédiat Hydratation'
  ]
  
  let deletedCount = 0
  
  for (const duplicateName of duplicatesToRemove) {
    const products = await prisma.product.findMany({
      where: {
        name: duplicateName,
        brand_id: pharmacerisBrand.id
      }
    })
    
    if (products.length > 0) {
      for (const product of products) {
        try {
          console.log(`🗑️ Deleting duplicate: ${product.name}`)
          
          // Delete related records first
          await prisma.cartItem.deleteMany({ where: { product_id: product.id } })
          await prisma.orderItem.deleteMany({ where: { product_id: product.id } })
          await prisma.review.deleteMany({ where: { product_id: product.id } })
          
          // Delete the product
          await prisma.product.delete({
            where: { id: product.id }
          })
          
          deletedCount++
        } catch (error) {
          console.log(`❌ Error deleting ${product.name}:`, error.message)
        }
      }
    }
  }
  
  console.log(`\n📊 SUMMARY:`)
  console.log(`📝 Moved ${movedCount} products to GAMME F`)
  console.log(`🗑️ Deleted ${deletedCount} duplicate products`)
  
  // Final verification
  const finalProducts = await prisma.product.findMany({
    where: {
      brand_id: pharmacerisBrand.id
    },
    include: {
      category: true
    },
    orderBy: {
      name: 'asc'
    }
  })
  
  console.log(`\n📦 Final Pharmaceris products: ${finalProducts.length}`)
  console.log('\n📋 Final product list by category:')
  
  const categories = ['GAMME W - Anti-Taches', 'GAMME V - Vitiligo', 'GAMME T - Acnéique', 'GAMME S - Protection solaire', 'GAMME P - Psoriasis', 'GAMME H - Cheveux et Cuir chevelu', 'GAMME E - Peau Sèche et Atopique', 'GAMME A - Peau Allergique et Sensible', 'GAMME F - Fluid Fondation']
  
  for (const categoryName of categories) {
    const categoryProducts = finalProducts.filter(p => p.category?.name === categoryName)
    console.log(`\n${categoryName}:`)
    if (categoryProducts.length === 0) {
      console.log('  (No products)')
    } else {
      categoryProducts.forEach(product => {
        console.log(`  - ${product.name}`)
      })
    }
  }
  
  await prisma.$disconnect()
}

finalizePharmacerisOrganization().catch(console.error)
