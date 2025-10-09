import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDermedicProducts() {
  console.log('🔍 Checking current Dermedic products and categories...')
  
  // Find Dermedic brand
  const dermedicBrand = await prisma.brand.findFirst({
    where: {
      name: {
        contains: 'Dermedic',
        mode: 'insensitive'
      }
    }
  })
  
  if (!dermedicBrand) {
    console.log('❌ Dermedic brand not found in database')
    return
  }
  
  console.log(`✅ Found Dermedic brand: ${dermedicBrand.name} (ID: ${dermedicBrand.id})`)
  
  // Get all Dermedic products
  const dermedicProducts = await prisma.product.findMany({
    where: {
      brand_id: dermedicBrand.id
    },
    include: {
      category: true
    },
    orderBy: {
      name: 'asc'
    }
  })
  
  console.log(`\n📦 Found ${dermedicProducts.length} Dermedic products in database`)
  
  // Get all Dermedic categories
  const dermedicCategories = await prisma.category.findMany({
    where: {
      brand_id: dermedicBrand.id
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
  
  console.log(`\n📂 Found ${dermedicCategories.length} Dermedic categories`)
  
  // Display all products
  console.log('\n📋 All Dermedic products:')
  dermedicProducts.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name}`)
    console.log(`   - ID: ${product.id}`)
    console.log(`   - Category: ${product.category?.name || 'No category'}`)
    console.log(`   - Active: ${product.is_active}`)
    console.log('')
  })
  
  // Display all categories
  console.log('\n📂 All Dermedic categories:')
  dermedicCategories.forEach((category, index) => {
    console.log(`${index + 1}. ${category.name}`)
    console.log(`   - ID: ${category.id}`)
    console.log(`   - Slug: ${category.slug}`)
    console.log(`   - Products: ${category.products.length}`)
    console.log('')
  })
  
  await prisma.$disconnect()
}

checkDermedicProducts().catch(console.error)
