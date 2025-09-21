import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateCurrencyToTND() {
  try {
    console.log('💰 Updating all products to TND currency...')
    
    // Update all products to use TND currency
    const result = await prisma.product.updateMany({
      where: {
        currency: 'EUR'
      },
      data: {
        currency: 'TND'
      }
    })
    
    console.log(`✅ Updated ${result.count} products to TND currency`)
    
    // Verify the update
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        currency: true
      },
      take: 5
    })
    
    console.log('\n📦 Sample products after currency update:')
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   Price: ${product.price} ${product.currency}`)
      console.log('')
    })
    
    // Check currency distribution
    const currencies = await prisma.product.groupBy({
      by: ['currency'],
      _count: {
        currency: true
      }
    })
    
    console.log('📈 Currency distribution after update:')
    currencies.forEach(currency => {
      console.log(`   ${currency.currency}: ${currency._count.currency} products`)
    })
    
  } catch (error) {
    console.error('❌ Error updating currency:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateCurrencyToTND()

