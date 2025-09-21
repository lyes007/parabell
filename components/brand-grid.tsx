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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {brands.map((brand) => (
        <Link key={brand.id} href={`/brands/${brand.slug}`}>
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-sm hover:border-[#96A78D]/20 bg-white hover:bg-gradient-to-br hover:from-white hover:to-[#F0F0F0]/30">
            <CardContent className="p-8">
              <div className="aspect-[4/3] bg-gradient-to-br from-[#F0F0F0] to-[#D9E9CF] rounded-xl mb-6 flex items-center justify-center overflow-hidden relative group-hover:shadow-lg transition-all duration-300">
                {brand.logo_url ? (
                  <div className="relative w-full h-full flex items-center justify-center p-4">
                    <Image
                      src={brand.logo_url || "/placeholder.svg"}
                      alt={brand.name}
                      width={200}
                      height={150}
                      className="object-contain group-hover:scale-110 transition-transform duration-500 max-w-full max-h-full"
                      priority={false}
                    />
                    {/* Subtle overlay effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#96A78D]/5 to-[#B6CEB4]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  </div>
                ) : (
                  <div className="text-4xl font-bold text-[#96A78D] group-hover:scale-110 transition-transform duration-300">
                    {brand.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="text-center">
                <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-[#96A78D] transition-colors duration-300">
                  {brand.name}
                </h3>
                {brand.description && (
                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {brand.description}
                  </p>
                )}
                {/* View Products button */}
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="inline-flex items-center text-[#96A78D] font-medium text-sm hover:text-[#B6CEB4] transition-colors duration-300">
                    View Products
                    <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
