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
    badges: string[]
    inStock: boolean
  }
  onFiltersChange: (filters: any) => void
  category?: string
  brand?: string
}

export function ProductFilters({ filters, onFiltersChange, category, brand }: ProductFiltersProps) {
  const [availableBrands, setAvailableBrands] = useState<string[]>([])
  const [availableBadges] = useState<string[]>([
    "Vegan",
    "Organic",
    "Gluten-Free",
    "Sugar-Free",
    "Non-GMO",
    "Cruelty-Free",
  ])

  useEffect(() => {
    // Fetch available brands
    fetch("/api/brands")
      .then((res) => res.json())
      .then((brands) => {
        setAvailableBrands(brands.map((b: any) => b.name))
      })
      .catch(console.error)
  }, [])

  const handlePriceChange = (value: number[]) => {
    onFiltersChange({ ...filters, priceRange: value })
  }

  const handleBrandChange = (brandName: string, checked: boolean) => {
    const newBrands = checked ? [...filters.brands, brandName] : filters.brands.filter((b) => b !== brandName)
    onFiltersChange({ ...filters, brands: newBrands })
  }

  const handleBadgeChange = (badge: string, checked: boolean) => {
    const newBadges = checked ? [...filters.badges, badge] : filters.badges.filter((b) => b !== badge)
    onFiltersChange({ ...filters, badges: newBadges })
  }

  const clearFilters = () => {
    onFiltersChange({
      priceRange: [0, 1000],
      brands: [],
      badges: [],
      inStock: false,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold hidden lg:block">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear All
        </Button>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Price Range</Label>
        <div className="px-2">
          <Slider
            value={filters.priceRange}
            onValueChange={handlePriceChange}
            max={1000}
            min={0}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>€{filters.priceRange[0]}</span>
            <span>€{filters.priceRange[1]}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Availability */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Availability</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="in-stock"
            checked={filters.inStock}
            onCheckedChange={(checked) => onFiltersChange({ ...filters, inStock: checked })}
          />
          <Label htmlFor="in-stock" className="text-sm">
            In Stock Only
          </Label>
        </div>
      </div>

      <Separator />

      {/* Brands - only show if not filtering by specific brand */}
      {!brand && availableBrands.length > 0 && (
        <>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Brands</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableBrands.map((brandName) => (
                <div key={brandName} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brandName}`}
                    checked={filters.brands.includes(brandName)}
                    onCheckedChange={(checked) => handleBrandChange(brandName, checked as boolean)}
                  />
                  <Label htmlFor={`brand-${brandName}`} className="text-sm">
                    {brandName}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Product Badges */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Product Features</Label>
        <div className="space-y-2">
          {availableBadges.map((badge) => (
            <div key={badge} className="flex items-center space-x-2">
              <Checkbox
                id={`badge-${badge}`}
                checked={filters.badges.includes(badge)}
                onCheckedChange={(checked) => handleBadgeChange(badge, checked as boolean)}
              />
              <Label htmlFor={`badge-${badge}`} className="text-sm">
                {badge}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
