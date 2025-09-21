import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkImagePaths() {
  try {
    console.log('🔍 Checking image paths in database...')
    
    const products = await prisma.product.findMany({
      select: {
        name: true,
        images: true,
        brand: {
          select: { name: true }
        }
      },
      take: 10
    })
    
    console.log('\n📋 Sample product image paths:')
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.brand.name})`)
      console.log(`   Images: ${JSON.stringify(product.images)}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Error checking image paths:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkImagePaths()
