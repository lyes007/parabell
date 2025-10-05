"use client"

import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface ProductFiltersProps {
  filters: {
    priceRange: number[]
    brands: string[]
    categories: string[]
    inStock: boolean
  }
  onFiltersChange: (filters: any) => void
  category?: string
  brand?: string
}

export function ProductFilters({ filters, onFiltersChange, category, brand }: ProductFiltersProps) {
  const [availableBrands, setAvailableBrands] = useState<string[]>([])
  const [availableCategories, setAvailableCategories] = useState<string[]>([])

  useEffect(() => {
    // Fetch available brands
    fetch("/api/brands")
      .then((res) => res.json())
      .then((brands) => {
        setAvailableBrands(brands.map((b: any) => b.name))
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    // Fetch categories for the selected brand
    if (brand) {
      fetch(`/api/categories?brand=${brand}`)
        .then((res) => res.json())
        .then((data) => {
          setAvailableCategories(data.categories?.map((cat: any) => cat.name) || [])
        })
        .catch(console.error)
    } else {
      setAvailableCategories([])
    }
  }, [brand])

  const handlePriceChange = (value: number[]) => {
    onFiltersChange({ ...filters, priceRange: value })
  }

  const handleBrandChange = (brandName: string, checked: boolean) => {
    const newBrands = checked ? [...filters.brands, brandName] : filters.brands.filter((b) => b !== brandName)
    onFiltersChange({ ...filters, brands: newBrands })
  }


  const handleCategoryChange = (categoryName: string, checked: boolean) => {
    const newCategories = checked ? [...filters.categories, categoryName] : filters.categories.filter((c) => c !== categoryName)
    onFiltersChange({ ...filters, categories: newCategories })
  }

  const clearFilters = () => {
    onFiltersChange({
      priceRange: [0, 1000],
      brands: [],
      categories: [],
      inStock: false,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filter by price</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500 hover:text-gray-700">
          Clear All
        </Button>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <div className="px-2">
          <Slider
            value={filters.priceRange}
            onValueChange={handlePriceChange}
            max={1000}
            min={0}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-3">
            <span>Min price</span>
            <span>Max price</span>
          </div>
          <div className="flex justify-between text-sm font-medium text-gray-900 mt-1">
            <span>{filters.priceRange[0]} TND</span>
            <span>{filters.priceRange[1]} TND</span>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Filter
        </Button>
      </div>

      <Separator />

      {/* Categories - only show if a brand is selected */}
      {brand && availableCategories.length > 0 && (
        <>
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Categories</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableCategories.map((categoryName) => (
                <div key={categoryName} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${categoryName}`}
                    checked={filters.categories.includes(categoryName)}
                    onCheckedChange={(checked) => handleCategoryChange(categoryName, checked as boolean)}
                  />
                  <Label htmlFor={`category-${categoryName}`} className="text-sm text-gray-600">
                    {categoryName}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Filter by Stock */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Availability</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock"
              checked={filters.inStock}
              onCheckedChange={(checked) => onFiltersChange({ ...filters, inStock: checked })}
            />
            <Label htmlFor="in-stock" className="text-sm text-gray-600">
              In Stock Only
            </Label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Brands - only show if not filtering by specific brand */}
      {!brand && availableBrands.length > 0 && (
        <>
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Brands</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableBrands.map((brandName) => (
                <div key={brandName} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brandName}`}
                    checked={filters.brands.includes(brandName)}
                    onCheckedChange={(checked) => handleBrandChange(brandName, checked as boolean)}
                  />
                  <Label htmlFor={`brand-${brandName}`} className="text-sm text-gray-600">
                    {brandName}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

    </div>
  )
}
