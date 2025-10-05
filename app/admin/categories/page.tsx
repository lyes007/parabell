import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { CategoriesManagement } from "@/components/admin/categories-management"

export const metadata = {
  title: "Categories - Admin Dashboard",
  description: "Manage your category hierarchy",
}

export default function AdminCategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <CategoriesManagement />
        </main>
      </div>
    </div>
  )
}
