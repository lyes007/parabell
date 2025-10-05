import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const status = searchParams.get("status") // all, active, inactive

    // Build where clause
    const where: any = {
      deleted_at: null, // Only get non-deleted brands
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    // Status filter
    if (status && status !== "all") {
      if (status === "active") {
        where.is_active = true
      } else if (status === "inactive") {
        where.is_active = false
      }
    }

    const [brands, total] = await Promise.all([
      prisma.brand.findMany({
        where,
        include: {
          _count: {
            select: {
              products: {
                where: {
                  deleted_at: null,
                },
              },
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      }),
      prisma.brand.count({ where }),
    ])

    return NextResponse.json({
      brands,
      pagination: {
        total,
      },
    })
  } catch (error) {
    console.error("Error fetching admin brands:", error)
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, logo_url, is_active = true } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Check if slug already exists
    const existingBrand = await prisma.brand.findUnique({
      where: { slug },
    })

    if (existingBrand) {
      return NextResponse.json({ error: "Brand with this name already exists" }, { status: 400 })
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        slug,
        description,
        logo_url,
        is_active,
      },
    })

    return NextResponse.json(brand, { status: 201 })
  } catch (error) {
    console.error("Error creating brand:", error)
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get("id")

    if (!brandId) {
      return NextResponse.json({ error: "Brand ID is required" }, { status: 400 })
    }

    // Check if brand has products
    const productCount = await prisma.product.count({
      where: {
        brand_id: Number.parseInt(brandId),
        deleted_at: null,
      },
    })

    if (productCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete brand with existing products" },
        { status: 400 }
      )
    }

    // Soft delete the brand
    await prisma.brand.update({
      where: { id: Number.parseInt(brandId) },
      data: { deleted_at: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting brand:", error)
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 })
  }
}
