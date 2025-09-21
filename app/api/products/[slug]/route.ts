import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        slug: params.slug,
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

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Convert BigInt values to strings for JSON serialization
    const serializedProduct = {
      ...product,
      id: product.id.toString(),
      total_sold: product.total_sold.toString(),
    }

    return NextResponse.json(serializedProduct)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}
