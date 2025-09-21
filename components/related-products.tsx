import { ProductGrid } from "./product-grid"

interface RelatedProductsProps {
  productId: string
  brandId: number
}

export async function RelatedProducts({ productId, brandId }: RelatedProductsProps) {
  // Fetch related products from the same brand
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/products?brand_id=${brandId}&limit=4`,
    { cache: "no-store" },
  )

  let relatedProducts = []
  if (response.ok) {
    const data = await response.json()
    // Filter out the current product
    relatedProducts = data.products?.filter((p: any) => p.id !== productId) || []
  }

  if (relatedProducts.length === 0) {
    return null
  }

  return (
    <section className="mt-16">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Related Products</h2>
        <p className="text-gray-600">You might also be interested in these products</p>
      </div>

      <ProductGrid initialProducts={relatedProducts.slice(0, 4)} />
    </section>
  )
}
