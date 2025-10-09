import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkFortePharmaProducts() {
  console.log('🔍 Checking Forte Pharma products and categories...')
  
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
  const fortePharmaProducts = await prisma.product.findMany({
    where: {
      brand_id: fortePharmaBrand.id
    },
    include: {
      category: true
    }
  })
  
  console.log(`\n📦 Found ${fortePharmaProducts.length} Forte Pharma products:`)
  fortePharmaProducts.forEach(product => {
    console.log(`- ${product.name} (Category: ${product.category?.name || 'No category'})`)
  })
  
  // Get all categories for Forte Pharma brand
  const fortePharmaCategories = await prisma.category.findMany({
    where: {
      brand_id: fortePharmaBrand.id
    }
  })
  
  console.log(`\n📂 Found ${fortePharmaCategories.length} Forte Pharma categories:`)
  fortePharmaCategories.forEach(category => {
    console.log(`- ${category.name} (${category.slug})`)
  })
  
  await prisma.$disconnect()
}

checkFortePharmaProducts().catch(console.error)