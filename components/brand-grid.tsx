"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import type { Brand } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"

export function BrandGrid() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/brands")
      .then((res) => res.json())
      .then((data) => {
        setBrands(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching brands:", error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-8">
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl mb-6"></div>
              <div className="text-center">
                <div className="h-6 bg-gray-200 rounded mb-3 mx-auto w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 mx-auto w-full"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 mx-auto w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (brands.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No brands available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
      {brands.map((brand) => (
        <Link key={brand.id} href={`/brands/${brand.slug}`}>
          <div className="group hover:scale-105 transition-transform duration-300">
            {brand.logo_url ? (
              <div className="relative w-full h-24 flex items-center justify-center p-4">
                <Image
                  src={brand.logo_url || "/placeholder.svg"}
                  alt={brand.name}
                  width={120}
                  height={96}
                  className="object-contain group-hover:scale-110 transition-transform duration-300 max-w-full max-h-full"
                  priority={false}
                />
              </div>
            ) : (
              <div className="w-full h-24 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-2xl font-bold text-gray-400">
                  {brand.name.charAt(0)}
                </div>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
