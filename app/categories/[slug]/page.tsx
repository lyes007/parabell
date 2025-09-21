import { Suspense } from "react"
import { notFound } from "next/navigation"
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

interface CategoryPageProps {
  params: {
    slug: string
  }
}

// Category mapping for display names
const categoryMap: Record<string, { name: string; description: string }> = {
  vitamins: {
    name: "Vitamins & Supplements",
    description: "Essential nutrients and supplements for optimal health and wellness",
  },
  skincare: {
    name: "Skincare & Beauty",
    description: "Premium skincare products for healthy, glowing skin",
  },
  wellness: {
    name: "Wellness & Fitness",
    description: "Products to support your active lifestyle and overall wellness",
  },
  baby: {
    name: "Baby & Mother Care",
    description: "Gentle, safe products for mothers and babies",
  },
  medical: {
    name: "Medical Devices",
    description: "Professional medical devices and health monitoring equipment",
  },
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const category = categoryMap[params.slug]

  if (!category) {
    return {
      title: "Category Not Found - Para Bell",
    }
  }

  return {
    title: `${category.name} - Para Bell`,
    description: category.description,
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = categoryMap[params.slug]

  if (!category) {
    notFound()
  }

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
              <BreadcrumbLink href="/products">Products</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{category.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
          <p className="text-gray-600">{category.description}</p>
        </div>

        <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse rounded-lg" />}>
          <ProductListingContent category={params.slug} />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
