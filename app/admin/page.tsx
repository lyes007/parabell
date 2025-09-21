import { redirect } from "next/navigation"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export const metadata = {
  title: "Admin Dashboard - Para Bell",
  description: "Manage your Para Bell e-commerce store",
}

// Simple auth check - in production, use proper authentication
function checkAdminAuth() {
  // For demo purposes, always allow access
  // In production, implement proper authentication
  return true
}

export default function AdminPage() {
  if (!checkAdminAuth()) {
    redirect("/admin/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <AdminDashboard />
        </main>
      </div>
    </div>
  )
}
