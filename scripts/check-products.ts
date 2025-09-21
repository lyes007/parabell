import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkProducts() {
  try {
    console.log('🔍 Checking products in database...')
    
    // Count total products
    const totalProducts = await prisma.product.count()
    console.log(`📊 Total products in database: ${totalProducts}`)
    
    // Get first 5 products
    const products = await prisma.product.findMany({
      take: 5,
      include: {
        brand: true
      }
    })
    
    console.log('\n📦 First 5 products:')
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   Brand: ${product.brand.name}`)
      console.log(`   Price: ${product.price}`)
      console.log(`   Active: ${product.is_active}`)
      console.log(`   Images: ${JSON.stringify(product.images)}`)
      console.log('')
    })
    
    // Check featured products
    const featuredProducts = await prisma.product.findMany({
      where: { is_featured: true },
      take: 3
    })
    
    console.log(`⭐ Featured products: ${featuredProducts.length}`)
    featuredProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (Featured: ${product.is_featured})`)
    })
    
  } catch (error) {
    console.error('❌ Error checking products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProducts()
