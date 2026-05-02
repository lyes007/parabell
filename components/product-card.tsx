import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
  /** Green "Recommend" tag (e.g. Apriori-based related products). */
  recommendBadge?: boolean
}

export function ProductCard({ product, recommendBadge }: ProductCardProps) {
  const mainImage = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-TN", {
      style: "currency",
      currency: product.currency || "TND",
    }).format(price)
  }

  return (
    <div className="group">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-white mb-3">
        {recommendBadge && (
          <span
            className="absolute right-2 top-2 z-10 rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white shadow-sm"
            title="Recommended from purchase patterns"
          >
            Recommend
          </span>
        )}
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
          {(product as any)?.category?.name || product.brand.name}
        </div>

        {/* Price */}
        <div className="text-sm font-semibold text-gray-900">
          {formatPrice(product.price)}
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <Link
            href={`/products/${product.slug}?buy=1`}
            className="inline-flex items-center justify-center rounded-md bg-gray-900 px-3 py-2 text-white text-xs font-medium hover:bg-gray-800"
          >
            Buy Now
          </Link>
        </div>
      </div>
    </div>
  )
}
