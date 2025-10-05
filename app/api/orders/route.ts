import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      firstName,
      lastName,
      address,
      city,
      postalCode,
      country,
      phone,
      paymentMethod,
      notes,
      items,
      total,
      currency = "TND"
    } = body

    // Validate required fields
    if (!email || !firstName || !lastName || !address || !city || !postalCode || !country || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create shipping address object
    const shippingAddress = {
      firstName,
      lastName,
      address,
      city,
      postalCode,
      country,
      phone: phone || null,
    }

    // For now, use the same address for billing (can be updated later)
    const billingAddress = shippingAddress

    // Calculate total amount
    const totalAmount = total || items.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0)

    // Create the order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          email,
          status: "pending",
          total_amount: totalAmount,
          currency,
          shipping_address: shippingAddress,
          billing_address: billingAddress,
          payment_status: "pending",
          payment_method: paymentMethod,
          notes: notes || null,
        },
      })

      // Create order items
      const orderItems = await Promise.all(
        items.map((item: any) =>
          tx.orderItem.create({
            data: {
              order_id: newOrder.id,
              product_id: BigInt(item.product.id),
              quantity: item.quantity,
              price: item.product.price,
              total: item.product.price * item.quantity,
            },
          })
        )
      )

      return {
        ...newOrder,
        items: orderItems,
      }
    })

    // Convert BigInt values to strings for JSON serialization
    const serializedOrder = {
      ...order,
      id: order.id,
      total_amount: order.total_amount.toString(),
      items: order.items.map((item: any) => ({
        ...item,
        product_id: item.product_id.toString(),
        price: item.price.toString(),
        total: item.total.toString(),
      })),
    }

    return NextResponse.json({
      success: true,
      order: serializedOrder,
    })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    )
  }
}
