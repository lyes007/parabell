import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { BrandsManagement } from "@/components/admin/brands-management"

export const metadata = {
  title: "Brands - Admin Dashboard",
  description: "Manage your brand catalog",
}

export default function AdminBrandsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <BrandsManagement />
        </main>
      </div>
    </div>
  )
}
