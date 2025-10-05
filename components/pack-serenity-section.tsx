"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useEffect, useRef } from "react"

export function PackSerenitySection() {
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
            
            // Interpolate between green and light blue based on scroll progress
            const greenHue = 120 // Green hue
            const blueHue = 200 // Light blue hue
            const currentHue = greenHue + (blueHue - greenHue) * scrollProgress
            
            // Apply the color transition
            backgroundRef.current.style.background = `linear-gradient(135deg, hsl(${currentHue}, 60%, 95%) 0%, hsl(${currentHue}, 40%, 90%) 100%)`
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
                src="/Ban-selection-pack-serenite.png"
                alt="Pack Sérénité - Produits pour le sommeil et la relaxation"
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
                <span className="text-sm font-medium text-gray-700">Notre indispensable</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                <span className="text-blue-600">PACK SÉRÉNITÉ</span>
              </h2>

              <p className="text-xl text-gray-700 leading-relaxed">
                Besoin de retrouver des nuits douces et toute votre sérénité ?
              </p>

              <p className="text-lg text-gray-600 leading-relaxed">
                Avec ce trio sommeil-stress, vous agissez sur l'ensemble des facteurs favorisant le stress et les nuits agitées.
              </p>
            </div>

            <div className="pt-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Découvrez notre pack
              </Button>
            </div>

            {/* Product highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
              {[
                { name: "FortéNuit 8h", desc: "Sommeil réparateur" },
                { name: "FortéZen Spray", desc: "Relaxation immédiate" },
                { name: "Magnésium Marin", desc: "Anti-stress naturel" }
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
