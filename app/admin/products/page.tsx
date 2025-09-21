import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { ProductsManagement } from "@/components/admin/products-management"

export const metadata = {
  title: "Products - Admin Dashboard",
  description: "Manage your product catalog",
}

export default function AdminProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <ProductsManagement />
        </main>
      </div>
    </div>
  )
}
