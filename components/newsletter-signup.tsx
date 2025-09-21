"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, CheckCircle } from "lucide-react"

export function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter signup
    setIsSubscribed(true)
    setEmail("")
  }

  return (
    <section className="py-16 bg-gradient-to-r from-[#96A78D] to-[#B6CEB4]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Mail className="w-16 h-16 text-white mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Stay Healthy, Stay Informed</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Get expert health tips, exclusive offers, and be the first to know about new products.
            </p>
          </div>

          {!isSubscribed ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex gap-4">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-white border-0 text-gray-900 placeholder:text-gray-500"
                />
                <Button type="submit" className="bg-[#96A78D] hover:bg-[#B6CEB4] text-white px-8">
                  Subscribe
                </Button>
              </div>
              <p className="text-blue-100 text-sm mt-4">No spam, unsubscribe at any time. We respect your privacy.</p>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-2 text-white">
              <CheckCircle className="w-6 h-6 text-[#B6CEB4]" />
              <span className="text-lg">Thank you for subscribing!</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
