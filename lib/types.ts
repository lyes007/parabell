export interface Product {
  id: string
  brand_id: number
  sku?: string
  slug: string
  name: string
  short_description?: string
  description?: string
  highlights?: string
  price: number
  compare_at_price?: number
  currency: string
  cost_price?: number
  stock_quantity: number
  track_inventory: boolean
  inventory_policy: string
  low_stock_threshold: number
  weight_kg?: number
  length_cm?: number
  width_cm?: number
  height_cm?: number
  gtin?: string
  batch_number?: string
  expiry_date?: Date
  ingredients?: string
  allergens?: string
  dosage?: string
  directions?: string
  warnings?: string
  servings_per_container?: number
  net_content?: string
  attributes: Record<string, any>
  nutrition?: Record<string, any>
  badges: string[]
  images: ProductImage[]
  video_urls: string[]
  seo: Record<string, any>
  tags: string[]
  is_active: boolean
  is_featured: boolean
  published_at?: Date
  available_from?: Date
  avg_rating: number
  reviews_count: number
  total_sold: string // BigInt converted to string
  created_at: Date
  updated_at: Date
  deleted_at?: Date
  brand: Brand
}

export interface ProductImage {
  url: string
  alt: string
  type?: "hero" | "gallery" | "thumbnail"
}

export interface Brand {
  id: number
  name: string
  slug: string
  description?: string
  logo_url?: string
  is_active: boolean
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  image_url?: string
  parent_id?: number
  sort_order: number
  is_active: boolean
  children?: Category[]
}

export interface CartItem {
  id: string
  product_id: string
  quantity: number
  product: Product
}

export interface Cart {
  id: string
  user_id?: string
  session_id?: string
  items: CartItem[]
}

export interface Order {
  id: string
  user_id?: string
  email: string
  status: string
  total_amount: string // Decimal converted to string
  currency: string
  shipping_address: Record<string, any>
  billing_address: Record<string, any>
  payment_status: string
  payment_method?: string
  notes?: string
  created_at: Date
  updated_at: Date
  user?: User
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: string // Decimal converted to string
  total: string // Decimal converted to string
  product: Product
}
