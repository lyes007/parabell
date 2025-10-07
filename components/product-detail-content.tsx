"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import type { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/lib/cart-context"
import { useRouter, useSearchParams } from "next/navigation"
import { metaPixelEvents } from "@/components/meta-pixel"
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  Award,
  Plus,
  Minus,
  AlertTriangle,
  Info,
  Check,
} from "lucide-react"

interface ProductDetailContentProps {
  product: Product
}

export function ProductDetailContent({ product }: ProductDetailContentProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showAddedMessage, setShowAddedMessage] = useState(false)
  const [showBuyNow, setShowBuyNow] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
    paymentMethod: "cash_on_delivery",
    notes: "",
  })

  const { addItem } = useCart()

  const images = Array.isArray(product.images) ? product.images : []
  const mainImage = images[selectedImageIndex] || { url: "/placeholder.svg", alt: product.name }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-TN", {
      style: "currency",
      currency: product.currency || "TND",
    }).format(price)
  }

  const compareAt = product.compare_at_price ?? null
  const isOnSale = typeof compareAt === "number" && compareAt > product.price
  const discountPercentage = isOnSale ? Math.round(((compareAt - product.price) / compareAt) * 100) : 0

  const isInStock = !product.track_inventory || product.stock_quantity > 0
  const isLowStock = product.track_inventory && product.stock_quantity <= product.low_stock_threshold

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    try {
      addItem(product, quantity)
      setShowAddedMessage(true)
      setTimeout(() => setShowAddedMessage(false), 3000)
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  useEffect(() => {
    if (searchParams?.get("buy") === "1") {
      setShowBuyNow(true)
    }
  }, [searchParams])

  // Track product view with Meta Pixel
  useEffect(() => {
    metaPixelEvents.trackViewContent({
      id: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency,
      category: (product as any)?.category?.name,
      brand: product.brand.name,
    })
  }, [product])

  const finalTotal = useMemo(() => {
    return product.price * quantity
  }, [product.price, quantity])

  const handleBuyNowSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    try {
      const orderData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
        phone: formData.phone,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        items: [
          {
            id: `${product.id}-${Date.now()}`,
            product,
            quantity,
          },
        ],
        total: finalTotal,
        currency: product.currency || "TND",
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({} as any))
        throw new Error((errorData as any)?.error || "Failed to create order")
      }

      await response.json()
      router.push("/order-success")
    } catch (error) {
      console.error("Order processing error:", error)
      alert("Failed to process order. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-12">
      {/* Product Images */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="aspect-square bg-white rounded-2xl overflow-hidden relative">
          <Image
            src={mainImage.url || "/placeholder.svg"}
            alt={mainImage.alt || product.name}
            fill
            className="object-contain scale-90"
            priority
          />
          {isOnSale && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-[#96A78D] hover:bg-[#B6CEB4] text-white">-{discountPercentage}%</Badge>
            </div>
          )}
          {product.badges && product.badges.length > 0 && (
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {product.badges.slice(0, 3).map((badge, index) => (
                <Badge key={index} variant="secondary" className="bg-white/90 text-gray-700">
                  {badge}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail Images */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedImageIndex === index ? "border-[#96A78D]" : "border-gray-200"
                }`}
              >
                <Image
                  src={image.url || "/placeholder.svg"}
                  alt={image.alt || `${product.name} ${index + 1}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="text-sm text-gray-500 mb-2">{product.brand.name}</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

          {/* Rating */}
          {product.avg_rating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.avg_rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{product.avg_rating}</span>
              <span className="text-sm text-gray-500">({product.reviews_count} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
            {isOnSale && compareAt !== null && (
              <span className="text-xl text-gray-500 line-through">{formatPrice(compareAt)}</span>
            )}
          </div>

          {/* Short Description */}
          {product.short_description && (
            <p className="text-gray-600 leading-relaxed mb-6">{product.short_description}</p>
          )}
        </div>

        {/* Stock Status */}
        <div className="flex items-center gap-2">
          {isInStock ? (
            <>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-700 font-medium">
                {isLowStock ? `Only ${product.stock_quantity} left` : "In Stock"}
              </span>
            </>
          ) : (
            <>
              <div className="w-3 h-3 bg-[#96A78D] rounded-full"></div>
              <span className="text-red-700 font-medium">Out of Stock</span>
            </>
          )}
        </div>

        {/* Quantity and Add to Cart */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="px-4 py-2 font-medium">{quantity}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
                disabled={product.track_inventory && quantity >= product.stock_quantity}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <span className="text-sm text-gray-500">
              {product.net_content && `${product.net_content} per container`}
            </span>
          </div>

          <div className="flex gap-3">
            <Button
              size="lg"
              className="flex-1 bg-[#96A78D] hover:bg-[#B6CEB4] text-white"
              disabled={!isInStock || isAddingToCart}
              onClick={handleAddToCart}
            >
              {isAddingToCart ? (
                <>
                  <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : showAddedMessage ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
            <Button
              size="lg"
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
              disabled={!isInStock || isProcessing}
              onClick={() => setShowBuyNow((v) => !v)}
            >
              {showBuyNow ? "Close Checkout" : "Buy Now"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={isWishlisted ? "text-[#96A78D] border-[#96A78D]" : ""}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
            </Button>
            <Button variant="outline" size="lg">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
          {showBuyNow && (
            <div className="mt-4 border border-gray-200 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-3">Quick Checkout</h3>
              <form onSubmit={handleBuyNowSubmit} className="grid grid-cols-1 gap-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    required
                    type="text"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#96A78D]"
                  />
                  <input
                    required
                    type="text"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#96A78D]"
                  />
                </div>
                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#96A78D]"
                />
                <input
                  required
                  type="text"
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#96A78D]"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    required
                    type="text"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#96A78D]"
                  />
                  <input
                    required
                    type="text"
                    placeholder="Postal code"
                    value={formData.postalCode}
                    onChange={(e) => setFormData((p) => ({ ...p, postalCode: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#96A78D]"
                  />
                  <input
                    required
                    type="text"
                    placeholder="Country"
                    value={formData.country}
                    onChange={(e) => setFormData((p) => ({ ...p, country: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#96A78D]"
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#96A78D]"
                />
                <textarea
                  placeholder="Notes (optional)"
                  value={formData.notes}
                  onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#96A78D]"
                />
                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm text-gray-600">
                    Total: <span className="font-semibold text-gray-900">{formatPrice(finalTotal)}</span>
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-[#96A78D] hover:bg-[#B6CEB4] text-white"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Confirm Order"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-4 py-6 border-t border-gray-200">
          <div className="text-center">
            <Truck className="w-6 h-6 text-[#96A78D] mx-auto mb-2" />
            <div className="text-sm font-medium">Free Shipping</div>
            <div className="text-xs text-gray-500">Orders over €50</div>
          </div>
          <div className="text-center">
            <Shield className="w-6 h-6 text-[#96A78D] mx-auto mb-2" />
            <div className="text-sm font-medium">Secure Payment</div>
            <div className="text-xs text-gray-500">SSL Protected</div>
          </div>
          <div className="text-center">
            <Award className="w-6 h-6 text-[#96A78D] mx-auto mb-2" />
            <div className="text-sm font-medium">Quality Guaranteed</div>
            <div className="text-xs text-gray-500">30-day return</div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6">
                {product.description ? (
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                ) : (
                  <p className="text-gray-600">No detailed description available.</p>
                )}

                {product.highlights && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Key Benefits:</h4>
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: product.highlights }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ingredients" className="mt-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                {product.ingredients && (
                  <div>
                    <h4 className="font-semibold mb-3">Ingredients:</h4>
                    <p className="text-gray-600 leading-relaxed">{product.ingredients}</p>
                  </div>
                )}

                {product.allergens && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-yellow-800 mb-1">Allergen Information:</h5>
                        <p className="text-yellow-700 text-sm">{product.allergens}</p>
                      </div>
                    </div>
                  </div>
                )}

                {product.nutrition && (
                  <div>
                    <h4 className="font-semibold mb-3">Nutrition Information:</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                        {JSON.stringify(product.nutrition, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="mt-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                {product.dosage && (
                  <div>
                    <h4 className="font-semibold mb-3">Recommended Dosage:</h4>
                    <p className="text-gray-600">{product.dosage}</p>
                  </div>
                )}

                {product.directions && (
                  <div>
                    <h4 className="font-semibold mb-3">Directions for Use:</h4>
                    <p className="text-gray-600 leading-relaxed">{product.directions}</p>
                  </div>
                )}

                {product.warnings && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-[#B6CEB4] mt-0.5" />
                      <div>
                        <h5 className="font-medium text-red-800 mb-1">Important Warnings:</h5>
                        <p className="text-red-700 text-sm leading-relaxed">{product.warnings}</p>
                      </div>
                    </div>
                  </div>
                )}

                {product.servings_per_container && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-medium text-blue-800 mb-1">Container Information:</h5>
                    <p className="text-[#96A78D] text-sm">
                      {product.servings_per_container} servings per container
                      {product.net_content && ` • ${product.net_content}`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6">
                {Array.isArray((product as any).reviews) && (product as any).reviews.length > 0 ? (
                  <div className="space-y-6">
                    {(product as any).reviews.map((review: any) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{review.user.name || "Anonymous"}</span>
                              {review.is_verified && (
                                <Badge variant="secondary" className="text-xs">
                                  Verified Purchase
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {review.title && <h5 className="font-medium mb-2">{review.title}</h5>}
                        {review.comment && <p className="text-gray-600 leading-relaxed">{review.comment}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this product!</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
