import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPharmacerisProducts() {
  console.log('🔍 Checking current Pharmaceris products and categories...')
  
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
  
  console.log(`✅ Found Pharmaceris brand: ${pharmacerisBrand.name} (ID: ${pharmacerisBrand.id})`)
  
  // Get all Pharmaceris products
  const pharmacerisProducts = await prisma.product.findMany({
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
  
  console.log(`\n📦 Found ${pharmacerisProducts.length} Pharmaceris products in database`)
  
  // Get all Pharmaceris categories
  const pharmacerisCategories = await prisma.category.findMany({
    where: {
      brand_id: pharmacerisBrand.id
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
  
  console.log(`\n📂 Found ${pharmacerisCategories.length} Pharmaceris categories`)
  
  // Display all products
  console.log('\n📋 All Pharmaceris products:')
  pharmacerisProducts.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name}`)
    console.log(`   - ID: ${product.id}`)
    console.log(`   - Category: ${product.category?.name || 'No category'}`)
    console.log(`   - Active: ${product.is_active}`)
    console.log('')
  })
  
  // Display all categories
  console.log('\n📂 All Pharmaceris categories:')
  pharmacerisCategories.forEach((category, index) => {
    console.log(`${index + 1}. ${category.name}`)
    console.log(`   - ID: ${category.id}`)
    console.log(`   - Slug: ${category.slug}`)
    console.log(`   - Products: ${category.products.length}`)
    console.log('')
  })
  
  await prisma.$disconnect()
}

checkPharmacerisProducts().catch(console.error)
