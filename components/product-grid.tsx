"use client"

import { useState, useEffect } from "react"
import type { Product } from "@/lib/types"
import { ProductCard } from "./product-card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface ProductGridProps {
  initialProducts?: Product[]
  category?: string
  brand?: string
  search?: string
  featured?: boolean
  filters?: {
    priceRange: number[]
    brands: string[]
    categories: string[]
    inStock: boolean
  }
  sortBy?: string
  sortOrder?: string
  onTotalResultsChange?: (total: number) => void
}

export function ProductGrid({
  initialProducts = [],
  category,
  brand,
  search,
  featured,
  filters,
  sortBy = "created_at",
  sortOrder = "desc",
  onTotalResultsChange,
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts || [])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProducts = async (pageNum: number, reset = false) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "12",
        sort: sortBy,
        order: sortOrder,
      })

      if (category) params.append("category", category)
      if (brand) params.append("brand", brand)
      if (search) params.append("search", search)
      if (featured) params.append("featured", "true")

      // Add filter parameters
      if (filters) {
        if (filters.priceRange[0] > 0) params.append("minPrice", filters.priceRange[0].toString())
        if (filters.priceRange[1] < 1000) params.append("maxPrice", filters.priceRange[1].toString())
        if (filters.brands.length > 0) params.append("brands", filters.brands.join(","))
        if (filters.categories.length > 0) params.append("categories", filters.categories.join(","))
        if (filters.inStock) params.append("inStock", "true")
      }

      const response = await fetch(`/api/products?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()

      if (!data || !data.products) {
        throw new Error("Invalid response format")
      }

      if (reset) {
        setProducts(data.products || [])
      } else {
        setProducts((prev) => [...(prev || []), ...(data.products || [])])
      }

      setHasMore(pageNum < (data.pagination?.pages || 1))
      
      // Update total results count
      if (onTotalResultsChange && data.pagination?.total !== undefined) {
        onTotalResultsChange(data.pagination.total)
      }
    } catch (error) {
      console.error("Error loading products:", error)
      setError(error instanceof Error ? error.message : "Failed to load products")
      // Ensure products is always an array
      if (reset) {
        setProducts([])
        if (onTotalResultsChange) {
          onTotalResultsChange(0)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    loadProducts(nextPage)
  }

  // Reset when filters change
  useEffect(() => {
    setPage(1)
    loadProducts(1, true)
  }, [category, brand, search, featured, filters, sortBy, sortOrder])

  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : []

  return (
    <div className="space-y-8">
      {error && (
        <div className="text-center py-16">
          <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load products</h3>
            <p className="text-gray-600 text-sm mb-6">{error}</p>
            <Button 
              onClick={() => loadProducts(1, true)} 
              variant="outline" 
              size="sm" 
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {!error && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {safeProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {safeProducts.length === 0 && !loading && !error && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
          </p>
        </div>
      )}

      {hasMore && !error && (
        <div className="text-center pt-8">
          <Button 
            onClick={loadMore} 
            disabled={loading} 
            variant="outline" 
            size="lg"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                Loading more products...
              </>
            ) : (
              "Load More Products"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
