import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDermedicImages() {
  try {
    console.log('🔍 Checking Dermedic product image paths...')
    
    const products = await prisma.product.findMany({
      where: {
        brand: {
          name: 'Dermedic'
        }
      },
      select: {
        name: true,
        images: true
      },
      take: 10
    })
    
    console.log('\n📋 Dermedic product image paths:')
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   Database path: ${JSON.stringify(product.images)}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Error checking Dermedic images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDermedicImages()
