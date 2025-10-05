// This script helps debug cart functionality
// Run this in the browser console to test cart operations

console.log('🛒 Cart Debug Script Loaded')

// Test localStorage access
function testLocalStorage() {
  console.log('📝 Testing localStorage access...')
  
  try {
    const testKey = 'cart-test'
    const testValue = 'test-value'
    
    localStorage.setItem(testKey, testValue)
    const retrieved = localStorage.getItem(testKey)
    localStorage.removeItem(testKey)
    
    if (retrieved === testValue) {
      console.log('✅ localStorage is working correctly')
      return true
    } else {
      console.log('❌ localStorage retrieval failed')
      return false
    }
  } catch (error) {
    console.log('❌ localStorage access failed:', error)
    return false
  }
}

// Check current cart state
function checkCartState() {
  console.log('📝 Checking current cart state...')
  
  try {
    const cartData = localStorage.getItem('para-bell-cart')
    if (cartData) {
      const cart = JSON.parse(cartData)
      console.log('✅ Cart data found:', cart)
      console.log(`   Items: ${cart.length}`)
      cart.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.product.name} x${item.quantity}`)
      })
    } else {
      console.log('❌ No cart data found in localStorage')
    }
  } catch (error) {
    console.log('❌ Error reading cart data:', error)
  }
}

// Clear cart
function clearCart() {
  console.log('📝 Clearing cart...')
  localStorage.removeItem('para-bell-cart')
  console.log('✅ Cart cleared')
}

// Test adding an item
function testAddItem() {
  console.log('📝 Testing add item...')
  
  const testItem = {
    id: 'test-item-1',
    product: {
      id: '1',
      name: 'Test Product',
      slug: 'test-product',
      price: 10.00,
      currency: 'TND',
      images: [],
      brand: { name: 'Test Brand' },
      track_inventory: true,
      stock_quantity: 10,
      compare_at_price: null,
      badges: []
    },
    quantity: 1
  }
  
  try {
    const existingCart = localStorage.getItem('para-bell-cart')
    let cart = existingCart ? JSON.parse(existingCart) : []
    
    cart.push(testItem)
    localStorage.setItem('para-bell-cart', JSON.stringify(cart))
    
    console.log('✅ Test item added to cart')
    console.log('   Cart now has', cart.length, 'items')
  } catch (error) {
    console.log('❌ Error adding test item:', error)
  }
}

// Export functions to global scope for easy testing
(window as any).cartDebug = {
  testLocalStorage,
  checkCartState,
  clearCart,
  testAddItem
}

console.log('🎯 Cart debug functions available:')
console.log('   cartDebug.testLocalStorage() - Test localStorage access')
console.log('   cartDebug.checkCartState() - Check current cart state')
console.log('   cartDebug.clearCart() - Clear cart')
console.log('   cartDebug.testAddItem() - Add test item to cart')

