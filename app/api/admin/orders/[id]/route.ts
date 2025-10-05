import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: true,
                brand: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Convert BigInt values to strings for JSON serialization
    const serializedOrder = {
      ...order,
      total_amount: order.total_amount.toString(),
      items: order.items.map(item => ({
        ...item,
        product_id: item.product_id.toString(),
        price: item.price.toString(),
        total: item.total.toString(),
        product: {
          ...item.product,
          id: item.product.id.toString(),
          price: item.product.price.toString(),
        },
      })),
    }

    return NextResponse.json(serializedOrder)
  } catch (error) {
    console.error("Error fetching order details:", error)
    return NextResponse.json({ error: "Failed to fetch order details" }, { status: 500 })
  }
}

