import { ProductGrid } from "./product-grid"
import { prisma } from "@/lib/prisma"
import type { Product } from "@/lib/types"
import { getAprioriRecommendationIds } from "@/lib/association-rules"

interface RelatedProductsProps {
  productId: string
  brandId: number
}

export async function RelatedProducts({ productId, brandId }: RelatedProductsProps) {
  try {
    const aprioriIds = getAprioriRecommendationIds(productId, 8)

    let serializedProducts: Product[] = []
    let usedApriori = false

    if (aprioriIds.length > 0) {
      const uniqueIds = [...new Set(aprioriIds.map((id) => id.trim()))].filter((id) => id !== productId)
      const bigints = uniqueIds.map((id) => BigInt(id))

      const found = await prisma.product.findMany({
        where: {
          id: { in: bigints },
          is_active: true,
          published_at: {
            lte: new Date(),
          },
        },
        include: {
          brand: true,
        },
      })

      const byId = new Map(found.map((p) => [p.id.toString(), p]))
      const ordered = uniqueIds
        .map((id) => byId.get(id))
        .filter((p): p is NonNullable<typeof p> => p != null)
        .slice(0, 4)

      if (ordered.length > 0) {
        usedApriori = true
        serializedProducts = ordered.map((product) => ({
          ...product,
          id: product.id.toString(),
          total_sold: product.total_sold.toString(),
          recommendedByApriori: true,
        }))
      }
    }

    if (!usedApriori) {
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

      serializedProducts = relatedProducts.map((product) => ({
        ...product,
        id: product.id.toString(),
        total_sold: product.total_sold.toString(),
      }))
    }

    if (serializedProducts.length === 0) {
      return null
    }

    return (
      <section className="mt-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Related Products</h2>
          <p className="text-gray-600">
            {usedApriori
              ? "Often bought together based on order history"
              : "You might also be interested in these products"}
          </p>
        </div>

        <ProductGrid initialProducts={serializedProducts} staticListing />
      </section>
    )
  } catch (error) {
    console.error("Error fetching related products:", error)
    return null
  }
}
