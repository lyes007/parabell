import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brand = searchParams.get("brand")
    const brand_id = searchParams.get("brand_id")

    // Build where clause
    const where: any = {
      is_active: true,
    }

    if (brand) {
      where.brand = {
        slug: brand,
      }
    }

    if (brand_id) {
      where.brand_id = Number.parseInt(brand_id)
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        brand: {
          select: {
            name: true,
            slug: true
          }
        },
        _count: {
          select: { products: true }
        }
      },
      orderBy: {
        sort_order: 'asc'
      }
    })

    return NextResponse.json({
      categories
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}