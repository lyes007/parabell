"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react"

export function CartContent() {
  const { items, total, itemCount, updateQuantity, removeItem, clearCart } = useCart()
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  // Debug logging
  console.log("🛒 CartContent rendered with:", { items: items.length, total, itemCount })

  const formatPrice = (price: number, currency = "TND") => {
    return new Intl.NumberFormat("en-TN", {
      style: "currency",
      currency,
    }).format(price)
  }

  const handleQuantityUpdate = async (productId: string, newQuantity: number) => {
    setIsUpdating(productId)
    try {
      updateQuantity(productId, newQuantity)
    } finally {
      setIsUpdating(null)
    }
  }

  const handleRemoveItem = async (productId: string) => {
    setIsUpdating(productId)
    try {
      removeItem(productId)
    } finally {
      setIsUpdating(null)
    }
  }

  const shippingThreshold = 50
  const shippingCost = total >= shippingThreshold ? 0 : 5.99
  const finalTotal = total + shippingCost

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Discover our premium health and wellness products</p>
        <Button asChild size="lg" className="bg-[#96A78D] hover:bg-[#B6CEB4] text-white">
          <Link href="/products">
            Start Shopping
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Cart Items ({itemCount})</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCart}
            className="text-[#96A78D] hover:text-[#B6CEB4] bg-transparent"
          >
            Clear Cart
          </Button>
        </div>

        {items.map((item) => {
          const mainImage =
            Array.isArray(item.product.images) && item.product.images.length > 0 ? item.product.images[0] : null

          return (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                    <Link href={`/products/${item.product.slug}`}>
                      <Image
                        src={mainImage?.url || "/placeholder.svg"}
                        alt={mainImage?.alt || item.product.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </Link>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">{item.product.brand.name}</div>
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="font-semibold text-gray-900 hover:text-[#96A78D] transition-colors line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.product.id)}
                        disabled={isUpdating === item.product.id}
                        className="text-[#96A78D] hover:text-[#B6CEB4] hover:bg-[#F0F0F0]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Badges */}
                    {item.product.badges && item.product.badges.length > 0 && (
                      <div className="flex gap-1 mb-3">
                        {item.product.badges.slice(0, 2).map((badge, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Price and Quantity */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(item.product.price, item.product.currency)}
                        </span>
                        {item.product.compare_at_price && item.product.compare_at_price > item.product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(item.product.compare_at_price, item.product.currency)}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityUpdate(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isUpdating === item.product.id}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="px-3 py-1 font-medium min-w-[40px] text-center">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityUpdate(item.product.id, item.quantity + 1)}
                          disabled={
                            (item.product.track_inventory && item.quantity >= item.product.stock_quantity) ||
                            isUpdating === item.product.id
                          }
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right mt-2">
                      <span className="text-sm text-gray-500">
                        Subtotal: {formatPrice(item.product.price * item.quantity, item.product.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-24">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span>Subtotal ({itemCount} items)</span>
                <span>{formatPrice(total)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span className={shippingCost === 0 ? "text-green-600 font-medium" : ""}>
                  {shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}
                </span>
              </div>

              {total < shippingThreshold && (
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  Add {formatPrice(shippingThreshold - total)} more for free shipping!
                </div>
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between text-lg font-semibold mb-6">
              <span>Total</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>

            <Button asChild size="lg" className="w-full bg-[#96A78D] hover:bg-[#B6CEB4] text-white mb-3">
              <Link href="/checkout">
                Proceed to Checkout
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="w-full bg-transparent">
              <Link href="/products">Continue Shopping</Link>
            </Button>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="text-xs text-gray-600">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                    🔒
                  </div>
                  Secure Checkout
                </div>
                <div className="text-xs text-gray-600">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                    📦
                  </div>
                  Fast Delivery
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
