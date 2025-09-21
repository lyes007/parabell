import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProductListingContent } from "@/components/product-listing-content"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface BrandPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: BrandPageProps) {
  // In a real app, you'd fetch the brand data here
  const brandName = params.slug.charAt(0).toUpperCase() + params.slug.slice(1)

  return {
    title: `${brandName} Products - Para Bell`,
    description: `Explore all ${brandName} health and wellness products available at Para Bell.`,
  }
}

export default function BrandPage({ params }: BrandPageProps) {
  const brandName = params.slug.charAt(0).toUpperCase() + params.slug.slice(1)

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
              <BreadcrumbLink href="/brands">Brands</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{brandName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{brandName} Products</h1>
          <p className="text-gray-600">Discover all {brandName} health and wellness products</p>
        </div>

        <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse rounded-lg" />}>
          <ProductListingContent brand={params.slug} />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
