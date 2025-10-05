import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: {
        id: params.id,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                currency: true,
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
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Convert BigInt values to strings for JSON serialization
    const serializedOrder = {
      ...order,
      total_amount: order.total_amount.toString(),
      items: order.items.map((item) => ({
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
    console.error("Error fetching order:", error)
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, payment_status, payment_method } = body

    const updateData: any = {}
    if (status) updateData.status = status
    if (payment_status) updateData.payment_status = payment_status
    if (payment_method) updateData.payment_method = payment_method

    const order = await prisma.order.update({
      where: {
        id: params.id,
      },
      data: updateData,
    })

    // Convert BigInt values to strings for JSON serialization
    const serializedOrder = {
      ...order,
      total_amount: order.total_amount.toString(),
    }

    return NextResponse.json(serializedOrder)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    )
  }
}
