import { ProductGrid } from "./product-grid"
import { prisma } from "@/lib/prisma"

export async function FeaturedProducts() {
  try {
    // Fetch featured products directly from database
    const featuredProducts = await prisma.product.findMany({
      where: {
        is_featured: true,
        is_active: true,
        published_at: {
          lte: new Date(),
        },
      },
      include: {
        brand: true,
      },
      take: 8,
      orderBy: {
        created_at: "desc",
      },
    })

    // Convert BigInt values to strings for JSON serialization
    const serializedProducts = featuredProducts.map(product => ({
      ...product,
      id: product.id.toString(),
      total_sold: product.total_sold.toString(),
    }))

    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our most popular health and wellness products, carefully selected by our experts.
            </p>
          </div>

          {serializedProducts.length > 0 ? (
            <ProductGrid initialProducts={serializedProducts} featured={true} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No featured products available at the moment.</p>
            </div>
          )}
        </div>
      </section>
    )
  } catch (error) {
    console.error("Error fetching featured products:", error)
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our most popular health and wellness products, carefully selected by our experts.
            </p>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-500">Unable to load featured products at the moment.</p>
          </div>
        </div>
      </section>
    )
  }
}
