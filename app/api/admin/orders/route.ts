import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search")
    const status = searchParams.get("status") // all, pending, processing, shipped, completed, cancelled
    const paymentStatus = searchParams.get("payment_status") // all, pending, paid, failed, refunded

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    // Search filter
    if (search) {
      where.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { 
          shipping_address: {
            path: ["firstName"],
            string_contains: search
          }
        },
        { 
          shipping_address: {
            path: ["lastName"],
            string_contains: search
          }
        },
      ]
    }

    // Status filter
    if (status && status !== "all") {
      where.status = status
    }

    // Payment status filter
    if (paymentStatus && paymentStatus !== "all") {
      where.payment_status = paymentStatus
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
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
        orderBy: {
          created_at: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    // Convert BigInt values to strings for JSON serialization
    const serializedOrders = orders.map(order => ({
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
    }))

    return NextResponse.json({
      orders: serializedOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching admin orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, payment_status, notes } = body

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (payment_status) updateData.payment_status = payment_status
    if (notes !== undefined) updateData.notes = notes

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
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
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
