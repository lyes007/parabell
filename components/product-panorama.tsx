"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/types"

export function ProductPanorama() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRandomProducts = async () => {
      try {
        const response = await fetch("/api/products/random")
        const data = await response.json()
        if (data.products) {
          setProducts(data.products)
        }
      } catch (error) {
        console.error("Error fetching random products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRandomProducts()
  }, [])

  if (loading) {
    return (
      <div className="w-full h-20 sm:h-24 md:h-32 flex items-center justify-center">
        <div className="animate-pulse text-white/60 text-sm">Loading products...</div>
      </div>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <div className="w-full overflow-hidden px-2 sm:px-0">
      <div className="flex animate-scroll space-x-3 sm:space-x-4 md:space-x-6">
        {/* Duplicate the products array to create seamless loop */}
        {[...products, ...products].map((product, index) => {
          const mainImage = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null
          
          return (
            <Link
              key={`${product.id}-${index}`}
              href={`/products/${product.slug}`}
              className="flex-shrink-0 group cursor-pointer"
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 product-image-aggressive">
                {mainImage ? (
                  <Image
                    src={mainImage.url || "/placeholder.svg"}
                    alt={mainImage.alt || product.name}
                    fill
                    className="object-contain p-1 sm:p-2 group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, (max-width: 1024px) 96px, (max-width: 1280px) 112px, 128px"
                    style={{
                      backgroundColor: 'transparent',
                      filter: 'contrast(2.5) brightness(1.4) saturate(1.3)',
                      mixBlendMode: 'multiply',
                      opacity: 0.9
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-transparent">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full"></div>
                  </div>
                )}
                
                {/* Hover overlay - only show on larger screens */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex items-center justify-center">
                  <div className="text-white text-xs font-medium text-center px-2 bg-black/50 rounded-md">
                    {product.name.length > 15 ? `${product.name.substring(0, 15)}...` : product.name}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
