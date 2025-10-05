import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search")
    const status = searchParams.get("status") // all, active, inactive, featured
    const brand = searchParams.get("brand")

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      deleted_at: null, // Only get non-deleted products
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { short_description: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { brand: { name: { contains: search, mode: "insensitive" } } },
      ]
    }

    // Status filter
    if (status && status !== "all") {
      if (status === "active") {
        where.is_active = true
      } else if (status === "inactive") {
        where.is_active = false
      } else if (status === "featured") {
        where.is_featured = true
      }
    }

    // Brand filter
    if (brand && brand !== "all") {
      where.brand = {
        name: brand,
      }
    }

    const [products, total, brands] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          brand: true,
        },
        orderBy: {
          created_at: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
      prisma.brand.findMany({
        where: { is_active: true },
        select: { name: true },
        orderBy: { name: "asc" },
      }),
    ])

    // Convert BigInt values to strings for JSON serialization
    const serializedProducts = products.map(product => ({
      ...product,
      id: product.id.toString(),
      total_sold: product.total_sold.toString(),
    }))

    return NextResponse.json({
      products: serializedProducts,
      brands: brands.map(b => b.name),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching admin products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("id")

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    // Soft delete the product
    await prisma.product.update({
      where: { id: BigInt(productId) },
      data: { deleted_at: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
