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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      brand_id,
      category_id,
      price,
      stock_quantity = 0,
      is_active = true,
      is_featured = false,
      short_description,
      description,
      sku,
      compare_at_price,
      currency = "EUR",
      images,
    } = body

    if (!name || !brand_id || price === undefined) {
      return NextResponse.json(
        { error: "name, brand_id and price are required" },
        { status: 400 }
      )
    }

    // Validate brand exists
    const brand = await prisma.brand.findUnique({ where: { id: Number.parseInt(brand_id) } })
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 400 })
    }

    // Validate category if provided
    let categoryConnect: number | null = null
    if (category_id) {
      const category = await prisma.category.findUnique({ where: { id: Number.parseInt(category_id) } })
      if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 400 })
      }
      categoryConnect = category.id
    }

    // Generate slug from name; ensure uniqueness by appending counter if needed
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    let slug = baseSlug
    let suffix = 1
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`
    }

    // Normalize and validate images array if provided
    let imagesData: any[] | undefined
    if (Array.isArray(images)) {
      const allowedTypes = new Set(["hero", "gallery", "thumbnail"])
      imagesData = images
        .filter((img: any) => img && typeof img.url === "string" && img.url.trim().length > 0)
        .map((img: any) => ({
          url: String(img.url),
          alt: typeof img.alt === "string" ? img.alt : "",
          ...(img.type && allowedTypes.has(img.type) ? { type: img.type } : {}),
        }))
    }

    const created = await prisma.product.create({
      data: {
        name,
        brand_id: Number.parseInt(brand_id),
        category_id: categoryConnect,
        price: Number.parseFloat(price),
        stock_quantity: Number.parseInt(stock_quantity),
        is_active,
        is_featured,
        short_description,
        description,
        sku,
        compare_at_price: compare_at_price !== undefined && compare_at_price !== null ? Number.parseFloat(compare_at_price) : null,
        currency,
        slug,
        published_at: is_active ? new Date() : null,
        ...(imagesData ? { images: imagesData } : {}),
      },
      include: { brand: true },
    })

    const serialized = {
      ...created,
      id: created.id.toString(),
      total_sold: created.total_sold.toString(),
    }

    return NextResponse.json({ product: serialized }, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
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
