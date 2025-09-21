import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ShoppingCart } from "lucide-react"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency: product.currency || "EUR",
    }).format(price)
  }

  return (
    <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden border border-gray-200/40 hover:border-gray-300/60 transition-all duration-500 hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-2">
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100/50">
        <Link href={`/products/${product.slug}`} className="block h-full">
          {mainImage ? (
            <Image
              src={mainImage.url || "/placeholder.svg"}
              alt={mainImage.alt || product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="w-16 h-16 bg-gray-300 rounded-full opacity-40"></div>
            </div>
          )}
        </Link>

        {/* Badges */}
        {product.badges && product.badges.length > 0 && (
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {product.badges.slice(0, 2).map((badge, index) => (
              <div 
                key={index} 
                className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full border border-gray-200/60 shadow-sm"
              >
                {badge}
              </div>
            ))}
          </div>
        )}

        {/* Sale Badge */}
        {product.compare_at_price && product.compare_at_price > product.price && (
          <div className="absolute top-4 right-4">
            <div className="px-3 py-1.5 bg-gradient-to-r from-[#96A78D] to-[#B6CEB4] text-white text-xs font-semibold rounded-full shadow-lg">
              Sale
            </div>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Brand */}
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {product.brand.name}
        </div>

        {/* Product Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-[#96A78D] transition-colors duration-300 leading-tight">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        {product.short_description && (
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {product.short_description}
          </p>
        )}

        {/* Add to Cart Button */}
        <div className="pt-2">
          <button 
            className="wooden-cart-button w-full"
            disabled={!product.track_inventory || product.stock_quantity <= 0}
          >
            <svg viewBox="0 0 24 24">
              <path
                d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A.996.996 0 0 0 21.42 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"
              ></path>
            </svg>
            <span className="button-text">Add to cart</span>
          </button>
        </div>

        {/* Price */}
        <div className="flex items-baseline justify-center gap-2 pt-2">
          <span className="text-xl font-bold text-gray-900">{formatPrice(product.price)}</span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-sm text-gray-500 line-through">{formatPrice(product.compare_at_price)}</span>
          )}
        </div>

        {/* Stock Status */}
        {product.track_inventory && product.stock_quantity <= product.low_stock_threshold && (
          <div className="text-xs font-medium text-[#96A78D] pt-1">
            {product.stock_quantity > 0 ? `Only ${product.stock_quantity} left` : "Out of stock"}
          </div>
        )}
      </div>
    </div>
  )
}
