import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkFortePharmaCategories() {
  console.log('🔍 Checking Forte Pharma categories for duplicates...')
  
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
  
  console.log(`\n📂 Total Forte Pharma categories: ${categories.length}`)
  
  // Check for duplicates by name
  const categoryNames = categories.map(c => c.name)
  const duplicateNames = categoryNames.filter((name, index) => categoryNames.indexOf(name) !== index)
  
  if (duplicateNames.length > 0) {
    console.log(`\n❌ Found duplicate category names: ${duplicateNames.join(', ')}`)
  } else {
    console.log(`\n✅ No duplicate category names found`)
  }
  
  // Check for duplicates by slug
  const categorySlugs = categories.map(c => c.slug)
  const duplicateSlugs = categorySlugs.filter((slug, index) => categorySlugs.indexOf(slug) !== index)
  
  if (duplicateSlugs.length > 0) {
    console.log(`\n❌ Found duplicate category slugs: ${duplicateSlugs.join(', ')}`)
  } else {
    console.log(`\n✅ No duplicate category slugs found`)
  }
  
  // Display all categories with their details
  console.log('\n📋 All Forte Pharma categories:')
  categories.forEach((category, index) => {
    console.log(`\n${index + 1}. ${category.name}`)
    console.log(`   - ID: ${category.id}`)
    console.log(`   - Slug: ${category.slug}`)
    console.log(`   - Active: ${category.is_active}`)
    console.log(`   - Sort Order: ${category.sort_order}`)
    console.log(`   - Products: ${category.products.length}`)
    console.log(`   - Created: ${category.created_at}`)
    
    if (category.products.length > 0) {
      console.log(`   - Product list:`)
      category.products.forEach(product => {
        console.log(`     * ${product.name}`)
      })
    }
  })
  
  // Check for categories with no products
  const emptyCategories = categories.filter(c => c.products.length === 0)
  if (emptyCategories.length > 0) {
    console.log(`\n⚠️ Categories with no products: ${emptyCategories.length}`)
    emptyCategories.forEach(category => {
      console.log(`  - ${category.name} (ID: ${category.id})`)
    })
  }
  
  // Check for products without categories
  const allFortePharmaProducts = await prisma.product.findMany({
    where: {
      brand_id: fortePharmaBrand.id
    },
    include: {
      category: true
    }
  })
  
  const uncategorizedProducts = allFortePharmaProducts.filter(p => !p.category)
  if (uncategorizedProducts.length > 0) {
    console.log(`\n⚠️ Products without categories: ${uncategorizedProducts.length}`)
    uncategorizedProducts.forEach(product => {
      console.log(`  - ${product.name} (ID: ${product.id})`)
    })
  }
  
  await prisma.$disconnect()
}

checkFortePharmaCategories().catch(console.error)
