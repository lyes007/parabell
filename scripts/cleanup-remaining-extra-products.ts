import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Products that should remain (from your original list)
const keepProducts = [
  'Expert Hyaluronic',
  'Expert Collagène', 
  'Expert Cheveux',
  'Ultra boost 4g',
  'Ultra boost 4G',
  'Vitalité 4g shots',
  'Tigra+ Men',
  'Acerola Vitamine C',
  'Multivit\'Kids',
  'Forté Flex Max Articulations',
  'Forté Stresse 24H',
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

async function cleanupRemainingExtraProducts() {
  console.log('🧹 Cleaning up remaining extra Forte Pharma products...')
  
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
  
  // Get all remaining Forte Pharma products
  const allProducts = await prisma.product.findMany({
    where: {
      brand_id: fortePharmaBrand.id
    }
  })
  
  console.log(`📦 Found ${allProducts.length} Forte Pharma products`)
  
  let deletedCount = 0
  let keptCount = 0
  
  for (const product of allProducts) {
    // Check if this product should be kept
    const shouldKeep = keepProducts.some(keepName => 
      product.name.toLowerCase().includes(keepName.toLowerCase()) ||
      keepName.toLowerCase().includes(product.name.toLowerCase())
    )
    
    if (!shouldKeep) {
      try {
        console.log(`🗑️ Deleting extra product: ${product.name}`)
        
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
  console.log(`🗑️ Deleted: ${deletedCount} extra products`)
  
  // Final verification
  const finalProducts = await prisma.product.findMany({
    where: {
      brand_id: fortePharmaBrand.id
    },
    include: {
      category: true
    }
  })
  
  console.log(`\n📦 Final Forte Pharma products: ${finalProducts.length}`)
  finalProducts.forEach(product => {
    console.log(`- ${product.name} (Category: ${product.category?.name || 'No category'})`)
  })
  
  await prisma.$disconnect()
}

cleanupRemainingExtraProducts().catch(console.error)
