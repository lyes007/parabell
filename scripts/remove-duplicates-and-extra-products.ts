import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Exact products to keep (from your list) - these are the base names
const baseProductsToKeep = [
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

async function removeDuplicatesAndExtraProducts() {
  console.log('🧹 Removing duplicates and extra products...')
  
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
  
  // Group products by base name
  const productGroups: { [key: string]: any[] } = {}
  
  for (const product of allProducts) {
    // Find the base product name this belongs to
    let baseName = ''
    for (const baseProduct of baseProductsToKeep) {
      if (product.name.toLowerCase().includes(baseProduct.toLowerCase()) ||
          baseProduct.toLowerCase().includes(product.name.toLowerCase()) ||
          // Special cases
          (baseProduct === 'Multivit\'Kids' && product.name.toLowerCase().includes('multivit')) ||
          (baseProduct === 'Rétention d\'eau' && product.name.toLowerCase().includes('retention'))) {
        baseName = baseProduct
        break
      }
    }
    
    if (baseName) {
      if (!productGroups[baseName]) {
        productGroups[baseName] = []
      }
      productGroups[baseName].push(product)
    } else {
      // This product doesn't match any base product, mark for deletion
      if (!productGroups['DELETE']) {
        productGroups['DELETE'] = []
      }
      productGroups['DELETE'].push(product)
    }
  }
  
  let keptCount = 0
  let deletedCount = 0
  
  // Process each group
  for (const [baseName, products] of Object.entries(productGroups)) {
    if (baseName === 'DELETE') {
      // Delete all products that don't match any base product
      for (const product of products) {
        try {
          console.log(`🗑️ Deleting unmatched product: ${product.name}`)
          
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
          console.log(`  ❌ Error deleting ${product.name}:`, error.message)
        }
      }
    } else {
      // For each base product, keep only the best match
      if (products.length === 1) {
        console.log(`✅ Keeping: ${products[0].name}`)
        keptCount++
      } else {
        // Multiple products for same base name - keep the best one
        console.log(`🔄 Multiple products for "${baseName}":`)
        products.forEach(p => console.log(`  - ${p.name}`))
        
        // Choose the best product (prefer shorter names, active products, etc.)
        const bestProduct = products.reduce((best, current) => {
          // Prefer active products
          if (current.is_active && !best.is_active) return current
          if (!current.is_active && best.is_active) return best
          
          // Prefer shorter names (less verbose)
          if (current.name.length < best.name.length) return current
          if (current.name.length > best.name.length) return best
          
          // Prefer products with categories
          if (current.category && !best.category) return current
          if (!current.category && best.category) return best
          
          return best
        })
        
        console.log(`  ✅ Keeping best match: ${bestProduct.name}`)
        keptCount++
        
        // Delete the others
        for (const product of products) {
          if (product.id !== bestProduct.id) {
            try {
              console.log(`  🗑️ Deleting duplicate: ${product.name}`)
              
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
              console.log(`    ❌ Error deleting ${product.name}:`, error.message)
            }
          }
        }
      }
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

removeDuplicatesAndExtraProducts().catch(console.error)
