import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/cart-context"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const mainImage = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-TN", {
      style: "currency",
      currency: product.currency || "TND",
    }).format(price)
  }

  const handleAddToCart = () => {
    addItem(product, 1)
  }

  return (
    <div className="group">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-white mb-3">
        <Link href={`/products/${product.slug}`} className="block h-full">
          {mainImage ? (
            <Image
              src={mainImage.url || "/placeholder.svg"}
              alt={mainImage.alt || product.name}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-300 scale-90"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
            </div>
          )}
        </Link>
      </div>

      {/* Content */}
      <div className="text-center">
        {/* Product Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-gray-900 mb-1 hover:text-gray-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Category */}
        <div className="text-xs text-gray-500 mb-2">
          {product.category?.name || product.brand.name}
        </div>

        {/* Price */}
        <div className="text-sm font-semibold text-gray-900">
          {formatPrice(product.price)}
        </div>
      </div>
    </div>
  )
}
