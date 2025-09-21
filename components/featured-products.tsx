import { ProductGrid } from "./product-grid"

export async function FeaturedProducts() {
  let featuredProducts = []
  
  try {
    // Fetch featured products from API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/products?featured=true&limit=8`,
      {
        cache: "no-store",
      },
    )

    if (response.ok) {
      const data = await response.json()
      featuredProducts = Array.isArray(data.products) ? data.products : []
    } else {
      console.error("Failed to fetch featured products:", response.status, response.statusText)
    }
  } catch (error) {
    console.error("Error fetching featured products:", error)
    featuredProducts = []
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our most popular health and wellness products, carefully selected by our experts.
          </p>
        </div>

        {featuredProducts.length > 0 ? (
          <ProductGrid initialProducts={featuredProducts} featured={true} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No featured products available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  )
}
