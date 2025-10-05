import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Get current date and previous month for comparison
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get all stats in parallel
    const [
      totalOrders,
      totalProducts,
      totalCustomers,
      totalRevenue,
      lastMonthOrders,
      lastMonthRevenue,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      // Total orders
      prisma.order.count(),
      
      // Total active products
      prisma.product.count({
        where: {
          is_active: true,
          deleted_at: null,
        },
      }),
      
      // Total customers (users)
      prisma.user.count(),
      
      // Total revenue from completed orders
      prisma.order.aggregate({
        where: {
          status: "completed",
        },
        _sum: {
          total_amount: true,
        },
      }),
      
      // Last month orders count
      prisma.order.count({
        where: {
          created_at: {
            gte: lastMonth,
            lt: thisMonth,
          },
        },
      }),
      
      // Last month revenue
      prisma.order.aggregate({
        where: {
          status: "completed",
          created_at: {
            gte: lastMonth,
            lt: thisMonth,
          },
        },
        _sum: {
          total_amount: true,
        },
      }),
      
      // Recent orders (last 5)
      prisma.order.findMany({
        take: 5,
        orderBy: {
          created_at: "desc",
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      }),
      
      // Low stock products
      prisma.product.findMany({
        where: {
          is_active: true,
          deleted_at: null,
          track_inventory: true,
          stock_quantity: {
            lte: 10, // Low stock threshold
          },
        },
        include: {
          brand: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          stock_quantity: "asc",
        },
        take: 5,
      }),
    ])

    // Calculate growth percentages
    const ordersGrowth = lastMonthOrders > 0 
      ? ((totalOrders - lastMonthOrders) / lastMonthOrders) * 100 
      : 0

    const revenueGrowth = lastMonthRevenue._sum.total_amount 
      ? ((Number(totalRevenue._sum.total_amount) - Number(lastMonthRevenue._sum.total_amount)) / Number(lastMonthRevenue._sum.total_amount)) * 100
      : 0

    // Format recent orders
    const formattedRecentOrders = recentOrders.map(order => ({
      id: order.id,
      customer: order.user?.name || 
        `${order.shipping_address?.firstName || ''} ${order.shipping_address?.lastName || ''}`.trim() || 
        'Guest',
      total: Number(order.total_amount),
      status: order.status,
      date: order.created_at.toISOString().split('T')[0],
    }))

    // Format low stock products
    const formattedLowStockProducts = lowStockProducts.map(product => ({
      id: product.id.toString(),
      name: product.name,
      brand: product.brand.name,
      stock: product.stock_quantity,
      threshold: product.low_stock_threshold,
    }))

    return NextResponse.json({
      stats: {
        totalOrders,
        totalProducts,
        totalCustomers,
        totalRevenue: Number(totalRevenue._sum.total_amount || 0),
        ordersGrowth: Math.round(ordersGrowth * 10) / 10, // Round to 1 decimal
        revenueGrowth: Math.round(revenueGrowth * 10) / 10, // Round to 1 decimal
      },
      recentOrders: formattedRecentOrders,
      lowStockProducts: formattedLowStockProducts,
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
