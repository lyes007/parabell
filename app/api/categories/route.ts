import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        is_active: true,
      },
      orderBy: {
        sort_order: "asc",
      },
    })

    // Build hierarchical structure
    const categoryMap = new Map()
    const rootCategories: any[] = []

    // First pass: create all categories
    categories.forEach((category) => {
      categoryMap.set(category.id, { ...category, children: [] })
    })

    // Second pass: build hierarchy
    categories.forEach((category) => {
      const categoryWithChildren = categoryMap.get(category.id)
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id)
        if (parent) {
          parent.children.push(categoryWithChildren)
        }
      } else {
        rootCategories.push(categoryWithChildren)
      }
    })

    return NextResponse.json(rootCategories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}
