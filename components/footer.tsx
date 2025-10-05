import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-6">
              <div className="flex items-center">
                <Image
                  src="/parabell-logo.png"
                  alt="ParaBell"
                  width={120}
                  height={40}
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-muted-foreground leading-relaxed text-pretty">
                Your trusted partner in health and wellness. We provide premium pharmaceutical products and expert
                guidance for your wellbeing.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon" className="hover:bg-primary hover:text-primary-foreground">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-primary hover:text-primary-foreground">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-primary hover:text-primary-foreground">
                  <Instagram className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <a href="/products" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    Products
                  </a>
                </li>
                <li>
                  <a href="/brands" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    Brands
                  </a>
                </li>
                <li>
                  <a href="/cart" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    Shopping Cart
                  </a>
                </li>
                <li>
                  <a href="/checkout" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    Checkout
                  </a>
                </li>
                <li>
                  <a href="/admin" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    Admin Panel
                  </a>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Customer Service</h3>
              <ul className="space-y-3">
                <li>
                  <a href="/products" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    Browse Products
                  </a>
                </li>
                <li>
                  <a href="/brands" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    Our Brands
                  </a>
                </li>
                <li>
                  <a href="/cart" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    My Cart
                  </a>
                </li>
                <li>
                  <a href="/order-success" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    Order Status
                  </a>
                </li>
                <li>
                  <a href="/admin" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    Admin Access
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter & Contact */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Stay Connected</h3>
              <p className="text-muted-foreground text-sm">Subscribe to get updates on new products and health tips.</p>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Input placeholder="Enter your email" className="flex-1" />
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Subscribe</Button>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>info@pharmacare.com</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>123 Health St, Wellness City</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">© 2024 ParaBell. All rights reserved.</p>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="/products" className="hover:text-primary transition-colors duration-200">
                Products
              </a>
              <a href="/brands" className="hover:text-primary transition-colors duration-200">
                Brands
              </a>
              <a href="/cart" className="hover:text-primary transition-colors duration-200">
                Cart
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
