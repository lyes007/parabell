import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProductDetailContent } from "@/components/product-detail-content"
import { RelatedProducts } from "@/components/related-products"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { prisma } from "@/lib/prisma"

interface ProductPageProps {
  params: {
    slug: string
  }
}

// Generate static params for all products
export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: {
        is_active: true,
        published_at: {
          lte: new Date(),
        },
      },
      select: {
        slug: true,
      },
    })

    return products.map((product) => ({
      slug: product.slug,
    }))
  } catch (error) {
    console.error("Error generating static params:", error)
    return []
  }
}

async function getProduct(slug: string) {
  try {
    // Direct database access - this works in both build time and runtime
    const product = await prisma.product.findUnique({
      where: {
        slug: slug,
        is_active: true,
      },
      include: {
        brand: true,
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                avatar_url: true,
              },
            },
          },
          orderBy: {
            created_at: "desc",
          },
        },
      },
    })

    if (product) {
      // Convert BigInt values to strings for JSON serialization
      return {
        ...product,
        id: product.id.toString(),
        total_sold: product.total_sold.toString(),
      }
    }

    return null
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await getProduct(params.slug)

  if (!product) {
    return {
      title: "Product Not Found - Para Bell",
    }
  }

  return {
    title: `${product.name} - Para Bell`,
    description: product.short_description || product.description?.substring(0, 160),
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug)

  if (!product) {
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
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <ProductDetailContent product={product} />

        <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse rounded-lg mt-16" />}>
          <RelatedProducts productId={product.id} brandId={product.brand_id} />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
