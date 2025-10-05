"use client"

import { useState, useEffect } from "react"
import type { Product } from "@/lib/types"
import { ProductCard } from "./product-card"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Star } from "lucide-react"
import { Loader2 } from "lucide-react"

export function TrendingProductsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTrendingProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({
          limit: "8",
          sort: "popularity",
          order: "desc",
          featured: "true"
        })

        const response = await fetch(`/api/products?${params}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()

        if (!data || !data.products) {
          throw new Error("Invalid response format")
        }

        setProducts(data.products || [])
      } catch (error) {
        console.error("Error loading trending products:", error)
        setError(error instanceof Error ? error.message : "Failed to load trending products")
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadTrendingProducts()
  }, [])

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/20 to-accent/30 px-4 py-2 rounded-full mb-6">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Tendances du moment</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            <span className="text-primary">Produits</span> Tendances
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Découvrez nos produits les plus populaires et les mieux notés par nos clients. 
            Des solutions de santé et bien-être qui font la différence.
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-gray-600">Chargement des produits tendances...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Impossible de charger les produits</h3>
              <p className="text-gray-600 text-sm mb-6">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                size="sm" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Réessayer
              </Button>
            </div>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {products.map((product, index) => (
                <div key={product.id} className="relative group">
                  {/* Trending badge for first 3 products */}
                  {index < 3 && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1 shadow-lg">
                        <Star className="w-3 h-3 fill-current" />
                        <span>#{index + 1}</span>
                      </div>
                    </div>
                  )}
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <a href="/products">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg group"
                >
                  Voir tous les produits
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                </Button>
              </a>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun produit tendance trouvé</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Nous n'avons pas encore de données sur les produits tendances. Revenez bientôt !
            </p>
          </div>
        )}

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-primary/40 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-accent/50 rounded-full animate-float opacity-40" style={{ animationDelay: "2s" }}></div>
        <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-primary/60 rounded-full animate-float opacity-50" style={{ animationDelay: "4s" }}></div>
      </div>
    </section>
  )
}
