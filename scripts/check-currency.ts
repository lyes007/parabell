import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkCurrency() {
  try {
    console.log('💰 Checking product currencies...')
    
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        currency: true
      },
      take: 5
    })
    
    console.log(`📊 Sample products with currency info:`)
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   Price: ${product.price} ${product.currency}`)
      console.log('')
    })
    
    // Check all currencies used
    const currencies = await prisma.product.groupBy({
      by: ['currency'],
      _count: {
        currency: true
      }
    })
    
    console.log('📈 Currency distribution:')
    currencies.forEach(currency => {
      console.log(`   ${currency.currency}: ${currency._count.currency} products`)
    })
    
  } catch (error) {
    console.error('❌ Error checking currency:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCurrency()

