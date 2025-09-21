import { prisma } from '../lib/prisma'

async function testProductPages() {
  try {
    console.log('🔍 Testing product pages...')
    
    // Get all active products
    const products = await prisma.product.findMany({
      where: {
        is_active: true,
        published_at: {
          lte: new Date(),
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        is_active: true,
        published_at: true,
      },
      take: 5, // Test first 5 products
    })

    console.log(`✅ Found ${products.length} active products:`)
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   Slug: ${product.slug}`)
      console.log(`   ID: ${product.id}`)
      console.log(`   Published: ${product.published_at}`)
      console.log('')
    })

    // Test individual product fetch
    if (products.length > 0) {
      const testProduct = products[0]
      console.log(`🧪 Testing individual product fetch for: ${testProduct.name}`)
      
      const productDetail = await prisma.product.findUnique({
        where: {
          slug: testProduct.slug,
          is_active: true,
        },
        include: {
          brand: true,
        },
      })

      if (productDetail) {
        console.log('✅ Product detail fetch successful!')
        console.log(`   Brand: ${productDetail.brand.name}`)
        console.log(`   Price: ${productDetail.price} ${productDetail.currency}`)
      } else {
        console.log('❌ Product detail fetch failed!')
      }
    }

    console.log('\n🎯 Product pages should work correctly!')
    console.log('📝 Make sure to:')
    console.log('   1. Set DATABASE_URL in Vercel environment variables')
    console.log('   2. Redeploy your application')
    console.log('   3. Test the product URLs in production')

  } catch (error) {
    console.error('❌ Error testing product pages:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testProductPages()
