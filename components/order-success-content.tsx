'use client'

import { useEffect } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Package, Mail, ArrowRight } from "lucide-react"
import { metaPixelEvents } from "@/components/meta-pixel"
import { useCart } from "@/lib/cart-context"

export function OrderSuccessContent() {
  const { items, total, clearCart } = useCart()

  useEffect(() => {
    // Track purchase completion with Meta Pixel
    if (items.length > 0) {
      const orderItems = items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        category: (item.product as any)?.category?.name,
        brand: item.product.brand.name,
      }))

      metaPixelEvents.trackPurchase({
        id: `order-${Date.now()}`, // Generate a unique order ID
        total: total,
        currency: items[0]?.product.currency || 'TND',
        items: orderItems,
      })

      // Clear the cart after successful purchase
      clearCart()
    }
  }, [items, total, clearCart])

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
      <p className="text-lg text-gray-600 mb-8">
        Thank you for your order. We've received your payment and will start processing your order right away.
      </p>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <Mail className="w-8 h-8 text-[#96A78D] mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Confirmation Email</h3>
              <p className="text-sm text-gray-600">Check your email for order details and tracking information</p>
            </div>
            <div>
              <Package className="w-8 h-8 text-[#96A78D] mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Processing</h3>
              <p className="text-sm text-gray-600">Your order will be processed within 24 hours</p>
            </div>
            <div>
              <CheckCircle className="w-8 h-8 text-[#96A78D] mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Delivery</h3>
              <p className="text-sm text-gray-600">Estimated delivery in 2-5 business days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg" className="bg-[#96A78D] hover:bg-[#B6CEB4] text-white">
          <Link href="/products">
            Continue Shopping
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  )
}
