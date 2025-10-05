"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useEffect, useRef } from "react"

export function HairLossProductSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const backgroundRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (sectionRef.current && backgroundRef.current) {
            const rect = sectionRef.current.getBoundingClientRect()
            const windowHeight = window.innerHeight
            
            // Calculate scroll progress (0 to 1) as the section enters the viewport
            const scrollProgress = Math.max(0, Math.min(1, (windowHeight - rect.top) / windowHeight))
            
            // Fade from light green to specific blue #8FC6F8
            const greenColor = 'rgb(240, 253, 244)' // from-green-50
            const blueColor = '#8FC6F8'
            
            // Interpolate between the two colors
            const r1 = 240, g1 = 253, b1 = 244 // green
            const r2 = 143, g2 = 198, b2 = 248 // blue #8FC6F8
            
            const r = Math.round(r1 + (r2 - r1) * scrollProgress)
            const g = Math.round(g1 + (g2 - g1) * scrollProgress)
            const b = Math.round(b1 + (b2 - b1) * scrollProgress)
            
            // Apply the color transition
            backgroundRef.current.style.background = `linear-gradient(135deg, rgb(${r}, ${g}, ${b}) 0%, rgb(${r}, ${g}, ${b}) 100%)`
          }
          
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative py-20 overflow-hidden transition-all duration-1000"
    >
      {/* Dynamic background */}
      <div 
        ref={backgroundRef}
        className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <div className="order-2 lg:order-1">
            <div className="relative">
              <Image
                src="/Generated Image September 23, 2025 - 3_40AM.png"
                alt="Dermedic Capilarte Anti-Dandruff Shampoo - 98% Dandruff Reduction"
                width={600}
                height={400}
                className="w-full h-auto"
                priority
              />
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-200 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-200 rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>
            </div>
          </div>

          {/* Text Section */}
          <div className="order-1 lg:order-2 space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                <span className="text-sm font-medium text-gray-700">Notre recommandation</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                <span className="text-blue-600">CAPILARTE</span>
              </h2>

              <p className="text-xl text-gray-700 leading-relaxed">
                Besoin de dire adieu aux pellicules et retrouver des cheveux sains ?
              </p>

              <p className="text-lg text-gray-600 leading-relaxed">
                Avec ce shampooing anti-pellicules, vous agissez directement sur les causes des pellicules et des irritations du cuir chevelu.
              </p>
            </div>

            <div className="pt-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Découvrez le produit
              </Button>
            </div>

            {/* Product highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
              {[
                { name: "98% Réduction", desc: "Des pellicules" },
                { name: "90% Apaisement", desc: "Des irritations" },
                { name: "Dermatologue", desc: "Recommandé" }
              ].map((product, index) => (
                <div
                  key={index}
                  className="bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <h4 className="font-semibold text-gray-900 text-sm">{product.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{product.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-blue-300 rounded-full animate-float opacity-60"></div>
      <div className="absolute top-40 right-20 w-6 h-6 bg-green-300 rounded-full animate-float opacity-40" style={{ animationDelay: "2s" }}></div>
      <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-blue-400 rounded-full animate-float opacity-50" style={{ animationDelay: "4s" }}></div>
    </section>
  )
}
