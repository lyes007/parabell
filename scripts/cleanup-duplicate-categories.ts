import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupDuplicateCategories() {
  console.log('🧹 Cleaning up duplicate Forte Pharma categories...')
  
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
  
  // Get all categories for Forte Pharma brand
  const categories = await prisma.category.findMany({
    where: {
      brand_id: fortePharmaBrand.id
    },
    include: {
      products: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })
  
  console.log(`📂 Found ${categories.length} Forte Pharma categories`)
  
  // Group categories by name
  const categoryGroups: { [key: string]: any[] } = {}
  
  for (const category of categories) {
    if (!categoryGroups[category.name]) {
      categoryGroups[category.name] = []
    }
    categoryGroups[category.name].push(category)
  }
  
  let mergedCount = 0
  let deletedCount = 0
  
  // Process each group
  for (const [categoryName, categoryList] of Object.entries(categoryGroups)) {
    if (categoryList.length > 1) {
      console.log(`\n🔄 Processing duplicate category: ${categoryName}`)
      console.log(`   Found ${categoryList.length} categories with this name`)
      
      // Find the category with the most products (or the first one if equal)
      const mainCategory = categoryList.reduce((best, current) => {
        if (current.products.length > best.products.length) return current
        if (current.products.length < best.products.length) return best
        // If equal, prefer the one with the lower ID (created first)
        return current.id < best.id ? current : best
      })
      
      console.log(`   ✅ Keeping main category: ${mainCategory.name} (ID: ${mainCategory.id}) with ${mainCategory.products.length} products`)
      
      // Move products from other categories to the main category
      for (const category of categoryList) {
        if (category.id !== mainCategory.id) {
          console.log(`   📦 Moving products from category ID ${category.id} to main category`)
          
          // Update all products in this category to point to the main category
          const updatedProducts = await prisma.product.updateMany({
            where: {
              category_id: category.id
            },
            data: {
              category_id: mainCategory.id
            }
          })
          
          console.log(`     ✅ Moved ${updatedProducts.count} products`)
          mergedCount += updatedProducts.count
          
          // Delete the duplicate category
          await prisma.category.delete({
            where: {
              id: category.id
            }
          })
          
          console.log(`     🗑️ Deleted duplicate category ID ${category.id}`)
          deletedCount++
        }
      }
    }
  }
  
  console.log('\n📊 CLEANUP SUMMARY:')
  console.log(`✅ Products merged: ${mergedCount}`)
  console.log(`🗑️ Duplicate categories deleted: ${deletedCount}`)
  
  // Final verification
  const finalCategories = await prisma.category.findMany({
    where: {
      brand_id: fortePharmaBrand.id
    },
    include: {
      products: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })
  
  console.log(`\n📂 Final Forte Pharma categories: ${finalCategories.length}`)
  
  finalCategories.forEach((category, index) => {
    console.log(`\n${index + 1}. ${category.name}`)
    console.log(`   - ID: ${category.id}`)
    console.log(`   - Slug: ${category.slug}`)
    console.log(`   - Products: ${category.products.length}`)
    
    if (category.products.length > 0) {
      console.log(`   - Product list:`)
      category.products.forEach(product => {
        console.log(`     * ${product.name}`)
      })
    }
  })
  
  await prisma.$disconnect()
}

cleanupDuplicateCategories().catch(console.error)
