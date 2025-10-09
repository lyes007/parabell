import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkLireneProducts() {
  console.log('🔍 Checking current Lirene products and categories...')
  
  // Find Lirene brand
  const lireneBrand = await prisma.brand.findFirst({
    where: {
      name: {
        contains: 'Lirene',
        mode: 'insensitive'
      }
    }
  })
  
  if (!lireneBrand) {
    console.log('❌ Lirene brand not found in database')
    return
  }
  
  console.log(`✅ Found Lirene brand: ${lireneBrand.name} (ID: ${lireneBrand.id})`)
  
  // Get all Lirene products
  const lireneProducts = await prisma.product.findMany({
    where: {
      brand_id: lireneBrand.id
    },
    include: {
      category: true
    },
    orderBy: {
      name: 'asc'
    }
  })
  
  console.log(`\n📦 Found ${lireneProducts.length} Lirene products in database`)
  
  // Get all Lirene categories
  const lireneCategories = await prisma.category.findMany({
    where: {
      brand_id: lireneBrand.id
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
  
  console.log(`\n📂 Found ${lireneCategories.length} Lirene categories`)
  
  // Display all products
  console.log('\n📋 All Lirene products:')
  lireneProducts.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name}`)
    console.log(`   - ID: ${product.id}`)
    console.log(`   - Category: ${product.category?.name || 'No category'}`)
    console.log(`   - Active: ${product.is_active}`)
    console.log('')
  })
  
  // Display all categories
  console.log('\n📂 All Lirene categories:')
  lireneCategories.forEach((category, index) => {
    console.log(`${index + 1}. ${category.name}`)
    console.log(`   - ID: ${category.id}`)
    console.log(`   - Slug: ${category.slug}`)
    console.log(`   - Products: ${category.products.length}`)
    console.log('')
  })
  
  await prisma.$disconnect()
}

checkLireneProducts().catch(console.error)
