/**
 * Meta Pixel Test Script
 * 
 * This script helps test Meta Pixel implementation by simulating events
 * Run this in your browser console on your live site to test pixel events
 */

// Test Meta Pixel Events
function testMetaPixelEvents() {
  console.log('🧪 Testing Meta Pixel Events...')
  
  // Check if Meta Pixel is loaded
  if (typeof window.fbq === 'undefined') {
    console.error('❌ Meta Pixel not loaded. Check your pixel ID and implementation.')
    return
  }
  
  console.log('✅ Meta Pixel is loaded')
  
  // Test PageView event
  console.log('📄 Testing PageView event...')
  window.fbq('track', 'PageView')
  
  // Test ViewContent event
  console.log('👁️ Testing ViewContent event...')
  window.fbq('track', 'ViewContent', {
    content_ids: ['test-product-123'],
    content_name: 'Test Product',
    content_type: 'product',
    value: 29.99,
    currency: 'TND',
    content_category: 'Supplements',
    brand: 'Test Brand',
  })
  
  // Test AddToCart event
  console.log('🛒 Testing AddToCart event...')
  window.fbq('track', 'AddToCart', {
    content_ids: ['test-product-123'],
    content_name: 'Test Product',
    content_type: 'product',
    value: 29.99,
    currency: 'TND',
    content_category: 'Supplements',
    brand: 'Test Brand',
    num_items: 1,
  })
  
  // Test InitiateCheckout event
  console.log('💳 Testing InitiateCheckout event...')
  window.fbq('track', 'InitiateCheckout', {
    content_ids: ['test-product-123'],
    content_type: 'product',
    value: 29.99,
    currency: 'TND',
    num_items: 1,
    contents: [{
      id: 'test-product-123',
      quantity: 1,
      item_price: 29.99,
      content_name: 'Test Product',
      content_category: 'Supplements',
      brand: 'Test Brand',
    }],
  })
  
  // Test Purchase event
  console.log('💰 Testing Purchase event...')
  window.fbq('track', 'Purchase', {
    content_ids: ['test-product-123'],
    content_type: 'product',
    value: 29.99,
    currency: 'TND',
    num_items: 1,
    contents: [{
      id: 'test-product-123',
      quantity: 1,
      item_price: 29.99,
      content_name: 'Test Product',
      content_category: 'Supplements',
      brand: 'Test Brand',
    }],
    order_id: 'test-order-123',
  })
  
  console.log('✅ All test events sent! Check Facebook Events Manager to verify.')
}

// Test custom events
function testCustomEvents() {
  console.log('🎯 Testing Custom Events...')
  
  if (typeof window.fbq === 'undefined') {
    console.error('❌ Meta Pixel not loaded.')
    return
  }
  
  // Test Lead event
  window.fbq('track', 'Lead', {
    value: 0,
    currency: 'TND',
  })
  
  // Test Search event
  window.fbq('track', 'Search', {
    search_string: 'vitamin c',
    content_type: 'product',
    num_items: 5,
  })
  
  // Test custom event
  window.fbq('trackCustom', 'NewsletterSignup', {
    method: 'footer_form',
    value: 0,
    currency: 'TND',
  })
  
  console.log('✅ Custom events sent!')
}

// Check pixel configuration
function checkPixelConfig() {
  console.log('🔍 Checking Pixel Configuration...')
  
  if (typeof window.fbq === 'undefined') {
    console.error('❌ Meta Pixel not loaded.')
    return
  }
  
  // Check if pixel is initialized
  console.log('✅ Meta Pixel is initialized')
  
  // You can add more configuration checks here
  console.log('📊 Pixel ready for tracking events')
}

// Run all tests
function runAllTests() {
  console.log('🚀 Running Meta Pixel Tests...')
  console.log('================================')
  
  checkPixelConfig()
  console.log('')
  testMetaPixelEvents()
  console.log('')
  testCustomEvents()
  console.log('')
  console.log('🎉 All tests completed!')
  console.log('Check Facebook Events Manager > Test Events to verify events are received.')
}

// Export functions for manual testing
window.testMetaPixelEvents = testMetaPixelEvents
window.testCustomEvents = testCustomEvents
window.checkPixelConfig = checkPixelConfig
window.runAllTests = runAllTests

console.log('🧪 Meta Pixel Test Script Loaded!')
console.log('Available functions:')
console.log('- runAllTests() - Run all tests')
console.log('- testMetaPixelEvents() - Test e-commerce events')
console.log('- testCustomEvents() - Test custom events')
console.log('- checkPixelConfig() - Check pixel configuration')
console.log('')
console.log('Run runAllTests() to start testing!')
