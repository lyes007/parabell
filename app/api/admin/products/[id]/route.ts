import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id
    const body = await request.json()
    
    const { name, price, stock_quantity, is_active, is_featured } = body

    // Validate required fields
    if (!name || price === undefined || stock_quantity === undefined) {
      return NextResponse.json(
        { error: "Name, price, and stock_quantity are required" },
        { status: 400 }
      )
    }

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id: BigInt(productId) },
      data: {
        name,
        price: parseFloat(price),
        stock_quantity: parseInt(stock_quantity),
        is_active: is_active !== undefined ? is_active : true,
        is_featured: is_featured !== undefined ? is_featured : false,
        updated_at: new Date(),
      },
      include: {
        brand: true,
      },
    })

    // Convert BigInt values to strings for JSON serialization
    const serializedProduct = {
      ...updatedProduct,
      id: updatedProduct.id.toString(),
      total_sold: updatedProduct.total_sold.toString(),
    }

    return NextResponse.json({
      product: serializedProduct,
      message: "Product updated successfully",
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id

    const product = await prisma.product.findUnique({
      where: { id: BigInt(productId) },
      include: {
        brand: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Convert BigInt values to strings for JSON serialization
    const serializedProduct = {
      ...product,
      id: product.id.toString(),
      total_sold: product.total_sold.toString(),
    }

    return NextResponse.json({ product: serializedProduct })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    )
  }
}

