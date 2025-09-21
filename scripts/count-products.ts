import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function countProducts() {
  try {
    console.log('📊 Counting products by brand...')
    
    const brands = await prisma.brand.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    })
    
    let totalProducts = 0
    
    console.log('\n📦 Products by brand:')
    brands.forEach(brand => {
      console.log(`${brand.name}: ${brand._count.products} products`)
      totalProducts += brand._count.products
    })
    
    console.log(`\n🎉 Total products in database: ${totalProducts}`)
    
    // Show some sample products
    const sampleProducts = await prisma.product.findMany({
      take: 5,
      include: {
        brand: true
      }
    })
    
    console.log('\n📋 Sample products:')
    sampleProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.brand.name}) - ${product.price} ${product.currency}`)
    })
    
  } catch (error) {
    console.error('❌ Error counting products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

countProducts()
