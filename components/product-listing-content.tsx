"use client"

import { useState } from "react"
import { ProductGrid } from "./product-grid"
import { ProductFilters } from "./product-filters"
import { ProductSort } from "./product-sort"
import { Button } from "@/components/ui/button"
import { Filter, X } from "lucide-react"

interface ProductListingContentProps {
  category?: string
  brand?: string
  search?: string
}

export function ProductListingContent({ category, brand, search }: ProductListingContentProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    brands: [] as string[],
    badges: [] as string[],
    inStock: false,
  })
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Mobile filter toggle */}
      <div className="lg:hidden">
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="w-full justify-center gap-2">
          <Filter className="w-4 h-4" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      {/* Filters sidebar */}
      <div className={`lg:w-64 ${showFilters ? "block" : "hidden lg:block"}`}>
        <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h3 className="text-lg font-semibold">Filters</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <ProductFilters filters={filters} onFiltersChange={setFilters} category={category} brand={brand} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {/* Sort and results header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="text-sm text-gray-600">
            Showing products {category && `in ${category}`} {brand && `from ${brand}`}
          </div>
          <ProductSort
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={(sort, order) => {
              setSortBy(sort)
              setSortOrder(order)
            }}
          />
        </div>

        {/* Product grid */}
        <ProductGrid
          category={category}
          brand={brand}
          search={search}
          filters={filters}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </div>
    </div>
  )
}
