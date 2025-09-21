import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { OrdersManagement } from "@/components/admin/orders-management"

export const metadata = {
  title: "Orders - Admin Dashboard",
  description: "Manage customer orders",
}

export default function AdminOrdersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <OrdersManagement />
        </main>
      </div>
    </div>
  )
}
