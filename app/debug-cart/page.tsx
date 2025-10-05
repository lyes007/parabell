"use client"

import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugCartPage() {
  const { items, total, itemCount, addItem, clearCart } = useCart()

  const testProduct = {
    id: "test-1",
    name: "Test Product",
    slug: "test-product",
    price: 10.00,
    currency: "TND",
    images: [],
    brand: { name: "Test Brand" },
    track_inventory: true,
    stock_quantity: 10,
    compare_at_price: null,
    badges: []
  }

  const handleAddTestItem = () => {
    addItem(testProduct, 1)
  }

  const handleClearCart = () => {
    clearCart()
  }

  const checkLocalStorage = () => {
    const cartData = localStorage.getItem("para-bell-cart")
    console.log("LocalStorage cart data:", cartData)
    if (cartData) {
      const parsed = JSON.parse(cartData)
      console.log("Parsed cart data:", parsed)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Cart Debug Page</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cart State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Items Count:</strong> {items.length}</p>
              <p><strong>Total Items:</strong> {itemCount}</p>
              <p><strong>Total Price:</strong> {total} TND</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cart Items</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-gray-500">No items in cart</p>
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={item.id} className="border p-2 rounded">
                    <p><strong>{item.product.name}</strong></p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: {item.product.price} {item.product.currency}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-x-4">
              <Button onClick={handleAddTestItem}>
                Add Test Item
              </Button>
              <Button onClick={handleClearCart} variant="outline">
                Clear Cart
              </Button>
              <Button onClick={checkLocalStorage} variant="secondary">
                Check LocalStorage
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Open browser console to see detailed cart logs.
              <br />
              Check localStorage for "para-bell-cart" key.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

