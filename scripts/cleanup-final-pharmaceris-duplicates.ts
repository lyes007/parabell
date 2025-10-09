import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupFinalPharmacerisDuplicates() {
  console.log('🧹 Final cleanup of Pharmaceris duplicates...')
  
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
  
  // Get all current Pharmaceris products
  const currentProducts = await prisma.product.findMany({
    where: {
      brand_id: pharmacerisBrand.id
    },
    include: {
      category: true
    }
  })
  
  console.log(`📦 Current Pharmaceris products: ${currentProducts.length}`)
  
  // Find and remove specific duplicates
  const duplicatesToRemove = [
    'Coup d\'éclat ,Hydratation et Prévention des Rides',
    'Coup d\'éclat Immédiat Hydratation',
    'Crème avec retinol pour l\'acné adulte la nuit'
  ]
  
  let deletedCount = 0
  
  for (const duplicateName of duplicatesToRemove) {
    const products = currentProducts.filter(p => p.name === duplicateName)
    
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
  
  console.log(`\n🗑️ Deleted ${deletedCount} duplicate products`)
  
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

cleanupFinalPharmacerisDuplicates().catch(console.error)
