import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const category = searchParams.get("category")
    const brand = searchParams.get("brand")
    const brand_id = searchParams.get("brand_id")
    const search = searchParams.get("search")
    const featured = searchParams.get("featured") === "true"
    const sort = searchParams.get("sort") || "created_at"
    const order = searchParams.get("order") || "desc"
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const brands = searchParams.get("brands")
    const badges = searchParams.get("badges")
    const categories = searchParams.get("categories")
    const inStock = searchParams.get("inStock") === "true"

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      is_active: true,
      published_at: {
        lte: new Date(),
      },
    }

    if (featured) {
      where.is_featured = true
    }

    if (brand) {
      where.brand = {
        slug: brand,
      }
    }

    if (brand_id) {
      where.brand_id = Number.parseInt(brand_id)
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { short_description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ]
    }

    // Price filters
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = Number.parseFloat(minPrice)
      if (maxPrice) where.price.lte = Number.parseFloat(maxPrice)
    }

    // Brand filter
    if (brands) {
      const brandList = brands.split(",")
      where.brand = {
        name: { in: brandList },
      }
    }

    // Badge filter
    if (badges) {
      const badgeList = badges.split(",")
      where.badges = {
        hasSome: badgeList,
      }
    }

    // Category filter (filter by category relationship)
    if (categories) {
      const categoryList = categories.split(",")
      where.category = {
        name: { in: categoryList }
      }
    }

    // Stock filter
    if (inStock) {
      where.OR = [
        { track_inventory: false },
        {
          AND: [{ track_inventory: true }, { stock_quantity: { gt: 0 } }],
        },
      ]
    }

    // Build orderBy clause
    const orderBy: any = {}
    if (sort === "price") {
      orderBy.price = order
    } else if (sort === "name") {
      orderBy.name = order
    } else if (sort === "rating") {
      orderBy.avg_rating = order
    } else {
      orderBy.created_at = order
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          brand: true,
          category: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    // Convert BigInt values to strings for JSON serialization
    const serializedProducts = products.map(product => ({
      ...product,
      id: product.id.toString(),
      total_sold: product.total_sold.toString(),
    }))

    return NextResponse.json({
      products: serializedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
