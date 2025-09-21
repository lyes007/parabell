// Using built-in fetch

async function testAPI() {
  try {
    console.log('🧪 Testing API endpoints...')
    
    // Test basic products endpoint
    const response = await fetch('http://localhost:3000/api/products?limit=3')
    const data = await response.json()
    
    console.log(`📊 Status: ${response.status}`)
    console.log(`📦 Products returned: ${data.products?.length || 0}`)
    
    if (data.products && data.products.length > 0) {
      console.log(`✅ First product: ${data.products[0].name}`)
      console.log(`💰 Price: ${data.products[0].price} ${data.products[0].currency}`)
      console.log(`🖼️ Image URL: ${data.products[0].images?.[0]?.url || 'No image'}`)
    } else {
      console.log('❌ No products returned')
    }
    
    // Test featured products
    const featuredResponse = await fetch('http://localhost:3000/api/products?featured=true&limit=3')
    const featuredData = await featuredResponse.json()
    
    console.log(`\n⭐ Featured products: ${featuredData.products?.length || 0}`)
    if (featuredData.products && featuredData.products.length > 0) {
      console.log(`✅ First featured: ${featuredData.products[0].name}`)
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error)
  }
}

testAPI()
