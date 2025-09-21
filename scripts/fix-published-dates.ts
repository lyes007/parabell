import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixPublishedDates() {
  try {
    console.log('🔧 Fixing published_at dates...')
    
    // Update all products to have published_at set to their created_at date
    const result = await prisma.product.updateMany({
      where: {
        published_at: null
      },
      data: {
        published_at: new Date()
      }
    })
    
    console.log(`✅ Updated ${result.count} products with published_at dates`)
    
    // Verify the fix
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        published_at: true,
        is_active: true
      },
      take: 5
    })
    
    console.log('\n📦 Sample products after fix:')
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   Published: ${product.published_at?.toISOString()}`)
      console.log(`   Active: ${product.is_active}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Error fixing published dates:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixPublishedDates()
