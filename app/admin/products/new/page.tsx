"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AdminBrandOption {
  id: number
  name: string
}

interface AdminCategoryOption {
  id: number
  name: string
}

type ProductImageType = "hero" | "gallery" | "thumbnail"

interface NewProductFormState {
  name: string
  brand_id: string
  category_id: string
  price: string
  stock_quantity: string
  is_active: boolean
  is_featured: boolean
  sku: string
  short_description: string
  description: string
  compare_at_price: string
  images: { url: string; alt: string; type?: ProductImageType }[]
}

export default function AdminNewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [brands, setBrands] = useState<AdminBrandOption[]>([])
  const [categories, setCategories] = useState<AdminCategoryOption[]>([])
  const [form, setForm] = useState<NewProductFormState>({
    name: "",
    brand_id: "",
    category_id: "",
    price: "",
    stock_quantity: "0",
    is_active: true,
    is_featured: false,
    sku: "",
    short_description: "",
    description: "",
    compare_at_price: "",
    images: [{ url: "", alt: "", type: "hero" }],
  })

  useEffect(() => {
    const loadRefs = async () => {
      try {
        const [brandsRes, categoriesRes] = await Promise.all([
          fetch("/api/admin/brands"),
          fetch("/api/admin/categories"),
        ])
        const brandsData = await brandsRes.json()
        const categoriesData = await categoriesRes.json()

        setBrands((brandsData.brands || []).map((b: any) => ({ id: b.id, name: b.name })))
        setCategories((categoriesData.categories || []).map((c: any) => ({ id: c.id, name: c.name })))
      } catch (e) {
        console.error("Failed to load references", e)
      }
    }
    loadRefs()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: form.price,
          stock_quantity: form.stock_quantity,
          compare_at_price: form.compare_at_price || null,
          category_id: form.category_id || null,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        alert(data.error || "Failed to create product")
        return
      }

      router.push("/admin/products")
    } catch (error) {
      console.error("Error creating product", error)
      alert("Failed to create product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-3xl">
            <Card>
              <CardHeader>
                <CardTitle>Add Product</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Product name"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Brand *</Label>
                      <Select value={form.brand_id} onValueChange={(v) => setForm({ ...form, brand_id: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((b) => (
                            <SelectItem key={b.id} value={String(b.id)}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">Price (EUR) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="compare_at_price">Compare at price</Label>
                      <Input
                        id="compare_at_price"
                        type="number"
                        step="0.01"
                        value={form.compare_at_price}
                        onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock_quantity">Stock quantity *</Label>
                      <Input
                        id="stock_quantity"
                        type="number"
                        value={form.stock_quantity}
                        onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        value={form.sku}
                        onChange={(e) => setForm({ ...form, sku: e.target.value })}
                        placeholder="e.g., FP-12345"
                      />
                    </div>
                    <div className="flex items-center gap-6 mt-8">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="is_active"
                          checked={form.is_active}
                          onCheckedChange={(v) => setForm({ ...form, is_active: Boolean(v) })}
                        />
                        <Label htmlFor="is_active">Active</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="is_featured"
                          checked={form.is_featured}
                          onCheckedChange={(v) => setForm({ ...form, is_featured: Boolean(v) })}
                        />
                        <Label htmlFor="is_featured">Featured</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="short_description">Short description</Label>
                    <Input
                      id="short_description"
                      value={form.short_description}
                      onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                      placeholder="Short summary"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Full product description"
                      rows={6}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Images</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setForm({
                            ...form,
                            images: [...form.images, { url: "", alt: "", type: "gallery" }],
                          })
                        }
                      >
                        Add image
                      </Button>
                    </div>
                    {form.images.map((img, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                        <div className="md:col-span-6 space-y-2">
                          <Label>Image URL</Label>
                          <Input
                            value={img.url}
                            onChange={(e) => {
                              const next = [...form.images]
                              next[idx] = { ...next[idx], url: e.target.value }
                              setForm({ ...form, images: next })
                            }}
                            placeholder="https://..."
                          />
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                const fd = new FormData()
                                fd.append("file", file)
                                try {
                                  const res = await fetch("/api/admin/uploads", { method: "POST", body: fd })
                                  const data = await res.json()
                                  if (!res.ok) {
                                    alert(data.error || "Upload failed")
                                    return
                                  }
                                  const next = [...form.images]
                                  next[idx] = { ...next[idx], url: data.url }
                                  setForm({ ...form, images: next })
                                } catch (err) {
                                  console.error("Upload error", err)
                                  alert("Upload failed")
                                }
                              }}
                            />
                          </div>
                        </div>
                        <div className="md:col-span-4">
                          <Label>Alt text</Label>
                          <Input
                            value={img.alt}
                            onChange={(e) => {
                              const next = [...form.images]
                              next[idx] = { ...next[idx], alt: e.target.value }
                              setForm({ ...form, images: next })
                            }}
                            placeholder="Description of image"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>Type</Label>
                          <Select
                            value={img.type || "gallery"}
                            onValueChange={(v) => {
                              const next = [...form.images]
                              next[idx] = { ...next[idx], type: v as ProductImageType }
                              setForm({ ...form, images: next })
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hero">hero</SelectItem>
                              <SelectItem value="gallery">gallery</SelectItem>
                              <SelectItem value="thumbnail">thumbnail</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-12 flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setForm({ ...form, images: form.images.filter((_, i) => i !== idx) })}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>Cancel</Button>
                    <Button type="submit" disabled={loading} className="bg-[#96A78D] hover:bg-[#B6CEB4] text-white">
                      {loading ? "Creating..." : "Create Product"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}



