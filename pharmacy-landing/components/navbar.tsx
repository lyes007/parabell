"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, ShoppingCart, User, Search } from "lucide-react"
import Image from "next/image"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled ? "glass-nav shadow-lg backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-3 animate-slide-in-left">
            <div className="relative">
              <Image
                src="/images/parabell-logo.png"
                alt="Para Bell Pharmacy"
                width={120}
                height={40}
                className="h-10 w-auto object-contain transition-transform duration-300 hover:scale-105"
                priority
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {["Products", "Categories", "Wellness", "About", "Contact"].map((item, index) => (
              <a
                key={item}
                href="#"
                className="relative text-foreground hover:text-primary transition-all duration-300 font-medium group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4 animate-slide-in-right">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent/50 transition-all duration-300 hover:scale-110"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent/50 transition-all duration-300 hover:scale-110"
            >
              <User className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent/50 transition-all duration-300 hover:scale-110 relative"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse-glow">
                2
              </span>
            </Button>
            <Button className="btn-flashy text-primary-foreground px-6 py-2 rounded-full font-semibold">
              Shop Now
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="hover:bg-accent/50 transition-all duration-300"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden animate-fade-in-up">
            <div className="px-2 pt-2 pb-3 space-y-1 glass-card rounded-2xl mt-2 mb-4 shadow-xl">
              {["Products", "Categories", "Wellness", "About", "Contact"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="block px-4 py-3 text-foreground hover:text-primary hover:bg-accent/30 rounded-xl transition-all duration-300 font-medium"
                >
                  {item}
                </a>
              ))}
              <div className="flex items-center justify-center space-x-4 px-4 py-3">
                <Button variant="ghost" size="icon" className="hover:bg-accent/50">
                  <Search className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-accent/50">
                  <User className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-accent/50 relative">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    2
                  </span>
                </Button>
              </div>
              <div className="px-4 py-2">
                <Button className="w-full btn-flashy text-primary-foreground rounded-full font-semibold">
                  Shop Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
