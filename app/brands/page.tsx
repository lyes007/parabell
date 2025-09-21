import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BrandGrid } from "@/components/brand-grid"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export const metadata = {
  title: "Brands - Para Bell",
  description: "Explore our trusted brands and their premium health and wellness products.",
}

export default function BrandsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Brands</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-12 text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#96A78D]/10 to-[#B6CEB4]/10 px-6 py-3 rounded-full mb-6">
            <div className="w-2 h-2 bg-[#96A78D] rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-[#96A78D]">Premium Partners</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our <span className="text-[#96A78D]">Trusted</span> Brands
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover premium health and wellness products from industry-leading brands that share our commitment to quality and innovation
          </p>
        </div>

        <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse rounded-lg" />}>
          <BrandGrid />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
