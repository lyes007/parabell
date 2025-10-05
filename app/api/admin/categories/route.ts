import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const status = searchParams.get("status") // all, active, inactive

    // Build where clause
    const where: any = {}

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

    const categories = await prisma.category.findMany({
      where,
      include: {
        parent: true,
        children: {
          include: {
            _count: {
              select: {
                children: true,
              },
            },
          },
        },
        _count: {
          select: {
            children: true,
          },
        },
      },
      orderBy: [
        { sort_order: "asc" },
        { name: "asc" },
      ],
    })

    return NextResponse.json({
      categories,
    })
  } catch (error) {
    console.error("Error fetching admin categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, image_url, parent_id, sort_order = 0, is_active = true } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    })

    if (existingCategory) {
      return NextResponse.json({ error: "Category with this name already exists" }, { status: 400 })
    }

    // Validate parent_id if provided
    if (parent_id) {
      const parent = await prisma.category.findUnique({
        where: { id: parent_id },
      })

      if (!parent) {
        return NextResponse.json({ error: "Parent category not found" }, { status: 400 })
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image_url,
        parent_id: parent_id ? Number.parseInt(parent_id) : null,
        sort_order: Number.parseInt(sort_order),
        is_active,
      },
      include: {
        parent: true,
        children: true,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("id")

    if (!categoryId) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 })
    }

    // Check if category has children
    const childrenCount = await prisma.category.count({
      where: {
        parent_id: Number.parseInt(categoryId),
      },
    })

    if (childrenCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with subcategories" },
        { status: 400 }
      )
    }

    // Delete the category
    await prisma.category.delete({
      where: { id: Number.parseInt(categoryId) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
