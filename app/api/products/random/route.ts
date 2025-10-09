import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Get random products with images
    const products = await prisma.product.findMany({
      where: {
        is_active: true,
        deleted_at: null,
        published_at: {
          lte: new Date(),
        },
        images: {
          not: "[]", // Ensure products have images
        },
      },
      include: {
        brand: true,
        category: true,
      },
      take: 12, // Get 12 random products for the panorama
      orderBy: {
        id: 'asc', // We'll randomize this in the application
      },
    })

    // Shuffle the products array to get random order
    const shuffledProducts = products.sort(() => Math.random() - 0.5)

    // Convert BigInt values to strings for JSON serialization
    const serializedProducts = shuffledProducts.map(product => ({
      ...product,
      id: product.id.toString(),
      total_sold: product.total_sold.toString(),
    }))

    return NextResponse.json({
      products: serializedProducts,
    })
  } catch (error) {
    console.error("Error fetching random products:", error)
    return NextResponse.json({ error: "Failed to fetch random products" }, { status: 500 })
  }
}
