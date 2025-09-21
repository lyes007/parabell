import { ProductGrid } from "./product-grid"
import { prisma } from "@/lib/prisma"

interface RelatedProductsProps {
  productId: string
  brandId: number
}

export async function RelatedProducts({ productId, brandId }: RelatedProductsProps) {
  try {
    // Fetch related products directly from database
    const relatedProducts = await prisma.product.findMany({
      where: {
        brand_id: brandId,
        is_active: true,
        published_at: {
          lte: new Date(),
        },
        id: {
          not: BigInt(productId),
        },
      },
      include: {
        brand: true,
      },
      take: 4,
      orderBy: {
        created_at: "desc",
      },
    })

    // Convert BigInt values to strings for JSON serialization
    const serializedProducts = relatedProducts.map(product => ({
      ...product,
      id: product.id.toString(),
      total_sold: product.total_sold.toString(),
    }))

    if (serializedProducts.length === 0) {
      return null
    }

    return (
      <section className="mt-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Related Products</h2>
          <p className="text-gray-600">You might also be interested in these products</p>
        </div>

        <ProductGrid initialProducts={serializedProducts} />
      </section>
    )
  } catch (error) {
    console.error("Error fetching related products:", error)
    return null
  }
}
