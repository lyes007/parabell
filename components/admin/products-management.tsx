"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter, Edit, Trash2, Eye, Package, AlertTriangle } from "lucide-react"
import { Product } from "@/lib/types"

export function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [brandFilter, setBrandFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(200)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 200,
    total: 0,
    pages: 0
  })
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    price: 0,
    stock_quantity: 0,
    is_active: true,
    is_featured: false
  })

  useEffect(() => {
    loadProducts()
  }, [searchTerm, statusFilter, brandFilter, currentPage, itemsPerPage])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(brandFilter !== "all" && { brand: brandFilter }),
      })
      
      const response = await fetch(`/api/admin/products?${params}`)
      const data = await response.json()
      setProducts(data.products || [])
      setBrands(data.brands || [])
      setPagination(data.pagination || { page: 1, limit: 50, total: 0, pages: 0 })
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-TN", {
      style: "currency",
      currency: "TND",
    }).format(price)
  }

  // Products are already filtered by the API, so we can use them directly
  const filteredProducts = products

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-800" }
    return { label: "In Stock", color: "bg-green-100 text-green-800" }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/products?id=${productId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Reload products after successful deletion
        loadProducts()
      } else {
        console.error("Failed to delete product")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  const resetFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setBrandFilter("all")
    setCurrentPage(1)
  }

  const startEditing = (product: Product) => {
    setEditingProduct(product.id)
    setEditForm({
      name: product.name,
      price: product.price,
      stock_quantity: product.stock_quantity,
      is_active: product.is_active,
      is_featured: product.is_featured
    })
  }

  const cancelEditing = () => {
    setEditingProduct(null)
    setEditForm({
      name: "",
      price: 0,
      stock_quantity: 0,
      is_active: true,
      is_featured: false
    })
  }

  const saveProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        // Update the product in the local state instantly
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product.id === productId 
              ? {
                  ...product,
                  name: editForm.name,
                  price: editForm.price,
                  stock_quantity: editForm.stock_quantity,
                  is_active: editForm.is_active,
                  is_featured: editForm.is_featured
                }
              : product
          )
        )
        setEditingProduct(null)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to update product")
      }
    } catch (error) {
      console.error("Error updating product:", error)
      alert("Failed to update product")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
            <p className="text-gray-600 mt-1">Manage your product catalog with ease</p>
        </div>
          <Button asChild className="w-full sm:w-auto bg-[#96A78D] hover:bg-[#B6CEB4] text-white">
          <Link href="/admin/products/new">
            <Plus className="w-4 h-4 mr-2" />
              Add New Product
          </Link>
        </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-600 font-medium">Total Products</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{pagination.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-50 to-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-600 font-medium">Out of Stock</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{products.filter((p) => p.stock_quantity === 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-600 font-medium">Featured</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{products.filter((p) => p.is_featured).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5 text-gray-600" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products by name, SKU, or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-gray-200 focus:border-[#96A78D] focus:ring-[#96A78D]"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 h-11 border-gray-200 focus:border-[#96A78D] focus:ring-[#96A78D]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>
            <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger className="w-full sm:w-48 h-11 border-gray-200 focus:border-[#96A78D] focus:ring-[#96A78D]">
                <SelectValue placeholder="Filter by brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
              <Button 
                variant="outline" 
                onClick={resetFilters} 
                className="w-full sm:w-auto h-11 border-gray-200 hover:bg-gray-50"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-sm text-gray-600 font-medium">
                Showing <span className="font-semibold text-gray-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, pagination.total)}</span> of <span className="font-semibold text-gray-900">{pagination.total}</span> products
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 font-medium">Show:</span>
                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="w-24 h-10 border-gray-200 focus:border-[#96A78D] focus:ring-[#96A78D]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600">per page</span>
              </div>
            </div>
            
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-10 px-4 border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 p-0 ${
                          currentPage === pageNum 
                            ? "bg-[#96A78D] hover:bg-[#B6CEB4] text-white" 
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                  className="h-10 px-4 border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="w-16 min-w-16 font-semibold text-gray-700">Image</TableHead>
                <TableHead className="min-w-48 max-w-64 font-semibold text-gray-700">Product</TableHead>
                <TableHead className="w-32 min-w-32 font-semibold text-gray-700">Brand</TableHead>
                <TableHead className="w-24 min-w-24 font-semibold text-gray-700">Price</TableHead>
                <TableHead className="w-20 min-w-20 font-semibold text-gray-700">Stock</TableHead>
                <TableHead className="w-32 min-w-32 font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const mainImage = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null
                const stockStatus = getStockStatus(product.stock_quantity)

                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={mainImage?.url || "/placeholder.svg"}
                          alt={mainImage?.alt || product.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="min-w-48 max-w-64">
                      {editingProduct === product.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editForm.name}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            className="text-sm w-full"
                          />
                          <div className="flex gap-1">
                            <label className="flex items-center gap-1 text-xs">
                              <input
                                type="checkbox"
                                checked={editForm.is_featured}
                                onChange={(e) => setEditForm({...editForm, is_featured: e.target.checked})}
                                className="rounded"
                              />
                              Featured
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate" title={product.name}>{product.name}</p>
                          <div className="flex gap-1 mt-1 flex-wrap">
                          {product.is_featured && (
                            <Badge variant="secondary" className="text-xs">
                              Featured
                            </Badge>
                          )}
                          {product.sku && (
                            <Badge variant="outline" className="text-xs">
                              {product.sku}
                            </Badge>
                          )}
                        </div>
                      </div>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600 w-32 min-w-32">
                      <span className="truncate block" title={product.brand.name}>{product.brand.name}</span>
                    </TableCell>
                    <TableCell className="w-24 min-w-24">
                      {editingProduct === product.id ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editForm.price}
                          onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value) || 0})}
                          className="w-full text-sm"
                        />
                      ) : (
                        <span className="font-medium text-sm">{formatPrice(product.price)}</span>
                      )}
                    </TableCell>
                    <TableCell className="w-20 min-w-20">
                      {editingProduct === product.id ? (
                        <Input
                          type="number"
                          value={editForm.stock_quantity}
                          onChange={(e) => setEditForm({...editForm, stock_quantity: parseInt(e.target.value) || 0})}
                          className="w-full text-sm"
                        />
                      ) : (
                        <Badge className={stockStatus.color} variant="secondary" className="text-xs">
                          {stockStatus.label}
                      </Badge>
                      )}
                    </TableCell>
                    <TableCell className="w-32 min-w-32">
                        <div className="flex items-center gap-1">
                          {editingProduct === product.id ? (
                            <>
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="h-7 w-7 p-0 text-xs"
                                onClick={() => saveProduct(product.id)}
                              >
                                ✓
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 w-7 p-0 text-xs"
                                onClick={cancelEditing}
                              >
                                ✕
                          </Button>
                            </>
                          ) : (
                            <>
                              <Button asChild variant="outline" size="sm" className="h-7 w-7 p-0">
                            <Link href={`/products/${product.slug}`}>
                                  <Eye className="w-3 h-3" />
                            </Link>
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="h-7 w-7 p-0"
                                onClick={() => startEditing(product)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                className="h-7 w-7 p-0"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            <div className="space-y-4 p-4">
              {filteredProducts.map((product) => {
                const mainImage = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null
                const stockStatus = getStockStatus(product.stock_quantity)

                return (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={mainImage?.url || "/placeholder.svg"}
                          alt={mainImage?.alt || product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        {editingProduct === product.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editForm.name}
                              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                              className="text-sm"
                            />
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1 text-xs">
                                <input
                                  type="checkbox"
                                  checked={editForm.is_featured}
                                  onChange={(e) => setEditForm({...editForm, is_featured: e.target.checked})}
                                  className="rounded"
                                />
                                Featured
                              </label>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">{product.name}</h3>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {product.is_featured && (
                                <Badge variant="secondary" className="text-xs">
                                  Featured
                                </Badge>
                              )}
                              {product.sku && (
                                <Badge variant="outline" className="text-xs">
                                  {product.sku}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-600">{product.brand.name}</div>
                              <Badge className={stockStatus.color} variant="secondary">
                                {stockStatus.label}
                              </Badge>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t">
                      {editingProduct === product.id ? (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label className="text-xs text-gray-600">Price (TND)</label>
                              <Input
                                type="number"
                                step="0.01"
                                value={editForm.price}
                                onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value) || 0})}
                                className="text-sm"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-xs text-gray-600">Stock</label>
                              <Input
                                type="number"
                                value={editForm.stock_quantity}
                                onChange={(e) => setEditForm({...editForm, stock_quantity: parseInt(e.target.value) || 0})}
                                className="text-sm"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => saveProduct(product.id)}
                            >
                              ✓ Save
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={cancelEditing}
                            >
                              ✕ Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-medium text-lg">{formatPrice(product.price)}</div>
                          </div>
                          <div className="flex gap-2">
                            <Button asChild variant="outline" size="sm" className="flex-1">
                              <Link href={`/products/${product.slug}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Link>
                            </Button>
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => startEditing(product)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              className="flex-1"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No products found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
