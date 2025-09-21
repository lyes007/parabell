"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Tag,
  FileText,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Products",
    icon: Package,
    children: [
      { name: "All Products", href: "/admin/products" },
      { name: "Add Product", href: "/admin/products/new" },
      { name: "Categories", href: "/admin/categories" },
      { name: "Brands", href: "/admin/brands" },
    ],
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "Marketing",
    icon: Tag,
    children: [
      { name: "Promotions", href: "/admin/promotions" },
      { name: "Coupons", href: "/admin/coupons" },
      { name: "Email Campaigns", href: "/admin/campaigns" },
    ],
  },
  {
    name: "Content",
    icon: FileText,
    children: [
      { name: "Pages", href: "/admin/pages" },
      { name: "Blog Posts", href: "/admin/blog" },
      { name: "Reviews", href: "/admin/reviews" },
    ],
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [openItems, setOpenItems] = useState<string[]>(["Products"])

  const toggleItem = (name: string) => {
    setOpenItems((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]))
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          if (item.children) {
            const isOpen = openItems.includes(item.name)
            const hasActiveChild = item.children.some((child) => pathname === child.href)

            return (
              <Collapsible key={item.name} open={isOpen} onOpenChange={() => toggleItem(item.name)}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between text-left font-normal",
                      (hasActiveChild || isOpen) && "bg-gray-100 text-[#96A78D]",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </div>
                    {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 ml-8 mt-1">
                  {item.children.map((child) => (
                    <Button
                      key={child.href}
                      asChild
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start font-normal text-gray-600",
                        pathname === child.href && "bg-[#D9E9CF] text-[#96A78D] font-medium",
                      )}
                    >
                      <Link href={child.href}>{child.name}</Link>
                    </Button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )
          }

          return (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className={cn(
                "w-full justify-start font-normal",
                pathname === item.href && "bg-[#D9E9CF] text-[#96A78D] font-medium",
              )}
            >
              <Link href={item.href}>
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            </Button>
          )
        })}
      </nav>
    </aside>
  )
}
