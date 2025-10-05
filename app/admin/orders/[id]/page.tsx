"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Mail, Phone, MapPin, Calendar, Package, User, CreditCard } from "lucide-react"
import { Order } from "@/lib/types"

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      loadOrderDetails(params.id as string)
    }
  }, [params.id])

  const loadOrderDetails = async (orderId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/orders/${orderId}`)
      const data = await response.json()
      
      if (response.ok) {
        setOrder(data)
      } else {
        console.error("Error loading order:", data.error)
      }
    } catch (error) {
      console.error("Error loading order details:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency: "EUR",
    }).format(numAmount)
  }

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-EU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "refunded":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-8">
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-8">
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
              <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
              <Button asChild>
                <Link href="/admin/orders">Back to Orders</Link>
              </Button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const customerName = order.user?.name || 
    `${order.shipping_address?.firstName || ''} ${order.shipping_address?.lastName || ''}`.trim() || 
    'Guest'

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-0 {
            border: none !important;
          }
        }
      `}</style>
      <div className="min-h-screen bg-gray-50">
        <div className="no-print">
          <AdminHeader />
        </div>
        <div className="flex">
          <div className="no-print">
            <AdminSidebar />
          </div>
          <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between no-print">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/orders">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Orders
                  </Link>
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
                  <p className="text-gray-600">Order #{order.id}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePrint}>
                  <Download className="w-4 h-4 mr-2" />
                  Print Invoice
                </Button>
              </div>
            </div>

            {/* Invoice Template */}
            <div className="bg-white rounded-lg shadow-sm border p-8 print:shadow-none print:border-0">
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="mb-4">
                    <Image
                      src="/parabell-logo.png"
                      alt="Para Bell Pharmacy"
                      width={150}
                      height={50}
                      className="h-12 w-auto object-contain"
                    />
                  </div>
                  <p className="text-gray-600">E-commerce Store</p>
                  <p className="text-gray-600">Your Health & Wellness Partner</p>
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">INVOICE</h3>
                  <p className="text-gray-600">Order #{order.id}</p>
                  <p className="text-gray-600">Date: {formatDate(order.created_at)}</p>
                </div>
              </div>

              {/* Order Status */}
              <div className="flex gap-4 mb-8">
                <Badge className={getStatusColor(order.status)} variant="secondary">
                  {order.status.toUpperCase()}
                </Badge>
                <Badge className={getPaymentStatusColor(order.payment_status)} variant="secondary">
                  Payment: {order.payment_status.toUpperCase()}
                </Badge>
              </div>

              {/* Customer & Shipping Info */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Customer Information
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{customerName}</p>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      {order.user?.email || order.email}
                    </p>
                    {order.shipping_address?.phone && (
                      <p className="text-gray-600 flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        {order.shipping_address.phone}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Shipping Address
                  </h4>
                  <div className="text-sm text-gray-600">
                    <p>{order.shipping_address?.firstName} {order.shipping_address?.lastName}</p>
                    <p>{order.shipping_address?.address}</p>
                    <p>{order.shipping_address?.city}, {order.shipping_address?.postalCode}</p>
                    <p>{order.shipping_address?.country}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Order Items
                </h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Product</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Brand</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Qty</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Price</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {order.items.map((item) => {
                        const mainImage = Array.isArray(item.product.images) && item.product.images.length > 0 
                          ? item.product.images[0] 
                          : null

                        return (
                          <tr key={item.id}>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                                  {mainImage ? (
                                    <Image
                                      src={mainImage.url}
                                      alt={mainImage.alt || item.product.name}
                                      width={48}
                                      height={48}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <Package className="w-6 h-6" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{item.product.name}</p>
                                  <p className="text-sm text-gray-500">SKU: {item.product.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600">
                              {item.product.brand.name}
                            </td>
                            <td className="px-4 py-4 text-center text-sm text-gray-900">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-4 text-right text-sm text-gray-900">
                              {formatCurrency(item.price)}
                            </td>
                            <td className="px-4 py-4 text-right text-sm font-medium text-gray-900">
                              {formatCurrency(item.total)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-6">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-900">{formatCurrency(order.total_amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="text-gray-900">Free</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax:</span>
                      <span className="text-gray-900">Included</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>{formatCurrency(order.total_amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="mt-8 pt-6 border-t">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment Information
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Payment Method:</p>
                    <p className="font-medium">{order.payment_method || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Status:</p>
                    <Badge className={getPaymentStatusColor(order.payment_status)} variant="secondary">
                      {order.payment_status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="mt-8 pt-6 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">Order Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {order.notes}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="mt-12 pt-6 border-t text-center text-sm text-gray-500">
                <p>Thank you for your business!</p>
                <p>For support, please contact us at support@parabell.com</p>
              </div>
            </div>
          </div>
          </main>
        </div>
      </div>
    </>
  )
}
