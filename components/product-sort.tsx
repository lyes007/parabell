"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProductSortProps {
  sortBy: string
  sortOrder: string
  onSortChange: (sortBy: string, sortOrder: string) => void
}

export function ProductSort({ sortBy, sortOrder, onSortChange }: ProductSortProps) {
  const sortOptions = [
    { value: "created_at-desc", label: "Newest First" },
    { value: "created_at-asc", label: "Oldest First" },
    { value: "name-asc", label: "Name A-Z" },
    { value: "name-desc", label: "Name Z-A" },
    { value: "price-asc", label: "Price Low to High" },
    { value: "price-desc", label: "Price High to Low" },
    { value: "rating-desc", label: "Highest Rated" },
    { value: "rating-asc", label: "Lowest Rated" },
  ]

  const currentValue = `${sortBy}-${sortOrder}`

  const handleSortChange = (value: string) => {
    const [sort, order] = value.split("-")
    onSortChange(sort, order)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 whitespace-nowrap">Sort by:</span>
      <Select value={currentValue} onValueChange={handleSortChange}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
