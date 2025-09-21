"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Truck, Clock, Sparkles, Leaf } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef } from "react"

export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null)
  const creamRef = useRef<HTMLDivElement>(null)
  const herbsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY
          const parallaxSpeed = 0.3 // Reduced parallax speed to improve performance

          if (creamRef.current) {
            creamRef.current.style.transform = `translateY(${scrollY * parallaxSpeed}px) rotate(${scrollY * 0.05}deg)`
          }

          if (herbsRef.current) {
            herbsRef.current.style.transform = `translateY(${scrollY * -parallaxSpeed * 0.6}px) rotate(${scrollY * -0.03}deg)`
          }

          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true }) // Added passive listener for better performance
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-background via-secondary/30 to-accent/40"
    >
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating cream background */}
        <div ref={creamRef} className="floating-bg-element top-20 right-10 w-96 h-96 opacity-20">
          <Image
            src="/cream.png"
            alt=""
            width={400}
            height={400}
            className="w-full h-full object-contain animate-parallax-float"
          />
        </div>

        {/* Floating herbs background */}
        <div ref={herbsRef} className="floating-bg-element bottom-20 left-10 w-80 h-80 opacity-25">
          <Image
            src="/herbs.png"
            alt=""
            width={320}
            height={320}
            className="w-full h-full object-contain animate-parallax-float"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="absolute top-32 left-1/4 w-64 h-64 bg-gradient-to-r from-primary/20 to-accent/30 animate-morphing-blob blur-3xl"></div>

        <div className="absolute top-1/4 left-1/3 animate-float">
          <Sparkles className="w-8 h-8 text-primary/40" />
        </div>
        <div className="absolute top-1/2 left-1/5 animate-float" style={{ animationDelay: "3s" }}>
          <Leaf className="w-10 h-10 text-primary/30" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20">
        <div className="flex flex-col items-center text-center space-y-10">
          <div className="space-y-8 max-w-4xl">
            <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full animate-fade-in-up">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Premium Wellness Solutions</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight animate-fade-in-up animate-delay-200">
              <span className="gradient-text">Natural Wellness</span>
              <br />
              <span className="text-foreground">Redefined</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed animate-fade-in-up animate-delay-400 text-pretty">
              Discover Para Bell's premium collection of pharmaceutical products and wellness solutions. Where nature
              meets science for your optimal health journey.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 animate-fade-in-up animate-delay-600">
            <a href="/products">
              <Button
                size="lg"
                className="btn-flashy text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold group"
              >
                Explore Products
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
              </Button>
            </a>
            <a href="/brands">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105"
              >
                View Brands
              </Button>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-12 animate-fade-in-up animate-delay-800 max-w-2xl">
            {[
              { icon: Truck, title: "Free Delivery", desc: "Orders over 50 TND", color: "text-primary" },
              { icon: Clock, title: "24/7 Support", desc: "Expert guidance", color: "text-accent" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 glass-card p-4 rounded-2xl hover:scale-105 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-accent/30 rounded-2xl flex items-center justify-center animate-pulse-glow">
                  <item.icon className={`h-7 w-7 ${item.color}`} />
                </div>
                <div>
                  <p className="font-bold text-lg text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
