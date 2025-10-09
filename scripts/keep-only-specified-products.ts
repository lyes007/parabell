import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Exact products to keep (from your list)
const productsToKeep = [
  // BEAUTÉ
  'Expert Hyaluronic',
  'Expert Collagène',
  'Expert Cheveux',
  
  // ENERGIE
  'Ultra boost 4g (effervescent)',
  'Ultra boost 4G',
  'Vitalité 4g shots',
  'Tigra+ Men',
  'Acerola Vitamine C',
  'Multivit\'Kids',
  
  // SANTÉ
  'Forté Flex Max Articulations',
  'Forté Stresse 24H',
  
  // MINCEUR
  'Calorilight',
  'Xtraslim 700',
  'Turbodraine AGRUMES',
  'Turbodraine ANANAS',
  'Turbodraine FRAMBOISE',
  'Turbodraine PÊCHE',
  'XtraSlim Capteur 3 en 1',
  'XtraSlim Coupe-Faim',
  'Rétention d\'eau'
]

async function keepOnlySpecifiedProducts() {
  console.log('🧹 Keeping only specified Forte Pharma products...')
  
  // Find Forte Pharma brand
  const fortePharmaBrand = await prisma.brand.findFirst({
    where: {
      name: {
        contains: 'Forte Pharma',
        mode: 'insensitive'
      }
    }
  })
  
  if (!fortePharmaBrand) {
    console.log('❌ Forte Pharma brand not found in database')
    return
  }
  
  console.log(`✅ Found Forte Pharma brand: ${fortePharmaBrand.name} (ID: ${fortePharmaBrand.id})`)
  
  // Get all Forte Pharma products
  const allProducts = await prisma.product.findMany({
    where: {
      brand_id: fortePharmaBrand.id
    },
    include: {
      category: true
    }
  })
  
  console.log(`📦 Found ${allProducts.length} Forte Pharma products in database`)
  
  let keptCount = 0
  let deletedCount = 0
  
  for (const product of allProducts) {
    // Check if this product should be kept
    const shouldKeep = productsToKeep.some(keepName => {
      // Exact match or partial match
      return product.name.toLowerCase().includes(keepName.toLowerCase()) ||
             keepName.toLowerCase().includes(product.name.toLowerCase()) ||
             // Handle special cases
             (keepName === 'Multivit\'Kids' && product.name.toLowerCase().includes('multivit')) ||
             (keepName === 'Rétention d\'eau' && product.name.toLowerCase().includes('retention'))
    })
    
    if (!shouldKeep) {
      try {
        console.log(`🗑️ Deleting: ${product.name}`)
        
        // Delete related records first
        await prisma.cartItem.deleteMany({ where: { product_id: product.id } })
        await prisma.orderItem.deleteMany({ where: { product_id: product.id } })
        await prisma.review.deleteMany({ where: { product_id: product.id } })
        
        // Delete the product
        await prisma.product.delete({
          where: { id: product.id }
        })
        
        console.log(`  ✅ Deleted: ${product.name}`)
        deletedCount++
      } catch (error) {
        console.log(`  ❌ Error deleting ${product.name}:`, error.message)
      }
    } else {
      console.log(`✅ Keeping: ${product.name}`)
      keptCount++
    }
  }
  
  console.log('\n📊 CLEANUP SUMMARY:')
  console.log(`✅ Kept: ${keptCount} products`)
  console.log(`🗑️ Deleted: ${deletedCount} products`)
  
  // Final verification
  const finalProducts = await prisma.product.findMany({
    where: {
      brand_id: fortePharmaBrand.id
    },
    include: {
      category: true
    },
    orderBy: {
      name: 'asc'
    }
  })
  
  console.log(`\n📦 Final Forte Pharma products: ${finalProducts.length}`)
  console.log('\n📋 Final product list by category:')
  
  const categories = ['BEAUTÉ', 'ENERGIE', 'SANTÉ', 'MINCEUR']
  
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
  
  // Check for products without categories
  const uncategorizedProducts = finalProducts.filter(p => !p.category)
  if (uncategorizedProducts.length > 0) {
    console.log('\n❌ Products without categories:')
    uncategorizedProducts.forEach(product => {
      console.log(`  - ${product.name}`)
    })
  }
  
  await prisma.$disconnect()
}

keepOnlySpecifiedProducts().catch(console.error)
