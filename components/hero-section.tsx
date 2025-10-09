"use client"

import { Button } from "@/components/ui/button"
import { PlantBasedButton } from "@/components/plant-based-button"
import { Truck, Clock, Sparkles, Leaf } from "lucide-react"
import { useRef } from "react"

export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null)

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen overflow-hidden"
    >
      {/* Video Background - Fixed */}
      <div className="fixed inset-0 w-full h-full -z-10">
        {/* Desktop Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="hidden md:block w-full h-full object-cover object-center"
        >
          <source src="/Untitled video - Made with Clipchamp (19).mp4" type="video/mp4" />
        </video>
        
        {/* Mobile Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="block md:hidden w-full h-full object-cover object-center"
        >
          <source src="/mobilevideo background.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Overlay for better text readability - Fixed */}
      <div className="fixed inset-0 bg-black/20 -z-10"></div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-32 left-1/4 w-64 h-64 bg-gradient-to-r from-primary/20 to-accent/30 animate-morphing-blob blur-3xl"></div>

        <div className="absolute top-1/4 left-1/3 animate-float">
          <Sparkles className="w-8 h-8 text-primary/40" />
        </div>
        <div className="absolute top-1/2 left-1/5 animate-float" style={{ animationDelay: "3s" }}>
          <Leaf className="w-10 h-10 text-primary/30" />
        </div>
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6 md:space-y-8">
            <div className="space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8 max-w-4xl">
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full animate-fade-in-up">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white">Premium Wellness Solutions</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight animate-fade-in-up animate-delay-200 font-dancing-script">
                <span className="gradient-text">Toujours Belle</span>
              </h1>

              <p className="text-xl md:text-2xl text-white/90 leading-relaxed animate-fade-in-up animate-delay-400 text-pretty">
                Discover Para Bell's premium collection of pharmaceutical products and wellness solutions. Where nature
                meets science for your optimal health journey.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 animate-fade-in-up animate-delay-600">
              <PlantBasedButton href="/products">
                Explore Products
              </PlantBasedButton>
              <a href="/brands">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-gray-900 bg-transparent px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105"
                >
                  View Brands
                </Button>
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 pt-4 sm:pt-6 md:pt-8 lg:pt-12 animate-fade-in-up animate-delay-800 max-w-2xl">
              {[
                { icon: Truck, title: "Free Delivery", desc: "Orders over 50 TND", color: "text-white" },
                { icon: Clock, title: "24/7 Support", desc: "Expert guidance", color: "text-white/80" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 glass-card p-4 rounded-2xl hover:scale-105 transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-accent/30 rounded-2xl flex items-center justify-center animate-pulse-glow">
                    <item.icon className={`h-7 w-7 ${item.color}`} />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-white">{item.title}</p>
                    <p className="text-sm text-white/80">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}
