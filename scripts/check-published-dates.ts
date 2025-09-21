import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPublishedDates() {
  try {
    console.log('🔍 Checking published_at dates...')
    
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        published_at: true,
        is_active: true,
        created_at: true
      }
    })
    
    console.log(`📊 Total products: ${products.length}`)
    
    const now = new Date()
    console.log(`🕐 Current time: ${now.toISOString()}`)
    
    let publishedCount = 0
    let unpublishedCount = 0
    
    products.forEach((product, index) => {
      const isPublished = product.published_at && product.published_at <= now
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   Published: ${product.published_at ? product.published_at.toISOString() : 'NULL'}`)
      console.log(`   Is Published: ${isPublished}`)
      console.log(`   Active: ${product.is_active}`)
      console.log('')
      
      if (isPublished) publishedCount++
      else unpublishedCount++
    })
    
    console.log(`✅ Published products: ${publishedCount}`)
    console.log(`❌ Unpublished products: ${unpublishedCount}`)
    
  } catch (error) {
    console.error('❌ Error checking published dates:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPublishedDates()
