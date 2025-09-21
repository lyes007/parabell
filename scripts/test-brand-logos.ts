// Test brand logos API

async function testBrandLogos() {
  try {
    console.log('🧪 Testing brand logos...')
    
    const response = await fetch('http://localhost:3000/api/brands')
    const brands = await response.json()
    
    console.log(`📊 Status: ${response.status}`)
    console.log(`🏢 Brands returned: ${brands.length}`)
    
    brands.forEach((brand: any) => {
      console.log(`\n✅ ${brand.name} (${brand.slug})`)
      console.log(`   Logo URL: ${brand.logo_url || 'No logo'}`)
      console.log(`   Description: ${brand.description ? brand.description.substring(0, 50) + '...' : 'No description'}`)
    })
    
    console.log('\n🎉 Brand logos test completed!')
    
  } catch (error) {
    console.error('❌ Brand logos test failed:', error)
  }
}

testBrandLogos()
