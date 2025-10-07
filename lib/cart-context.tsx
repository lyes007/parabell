"use client"

import { createContext, useContext, useReducer, useEffect, useState, type ReactNode } from "react"
import type { Product } from "@/lib/types"
import { metaPixelEvents } from "@/components/meta-pixel"

interface CartItem {
  id: string
  product: Product
  quantity: number
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
  isLoading: boolean
}

type CartAction =
  | { type: "ADD_ITEM"; payload: { product: Product; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: { productId: string } }
  | { type: "UPDATE_QUANTITY"; payload: { productId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOAD_CART"; payload: CartItem[] }

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const { product, quantity } = action.payload
      const existingItem = state.items.find((item) => item.product.id === product.id)

      let newItems: CartItem[]
      if (existingItem) {
        newItems = state.items.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        )
      } else {
        newItems = [...state.items, { id: `${product.id}-${Date.now()}`, product, quantity }]
      }

      const total = newItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { ...state, items: newItems, total, itemCount }
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.product.id !== action.payload.productId)
      const total = newItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { ...state, items: newItems, total, itemCount }
    }

    case "UPDATE_QUANTITY": {
      const { productId, quantity } = action.payload
      if (quantity <= 0) {
        return cartReducer(state, { type: "REMOVE_ITEM", payload: { productId } })
      }

      const newItems = state.items.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
      const total = newItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { ...state, items: newItems, total, itemCount }
    }

    case "CLEAR_CART":
      return { ...state, items: [], total: 0, itemCount: 0 }

    case "SET_LOADING":
      return { ...state, isLoading: action.payload }

    case "LOAD_CART": {
      const items = action.payload
      const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

      return { ...state, items, total, itemCount }
    }

    default:
      return state
  }
}

interface CartContextType extends CartState {
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  trackCheckoutInitiation: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const [isClient, setIsClient] = useState(false)

  // Set client flag after hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load cart from localStorage on mount (only on client)
  useEffect(() => {
    if (!isClient) return
    
    console.log("🛒 Loading cart from localStorage...")
    const savedCart = localStorage.getItem("para-bell-cart")
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart)
        console.log("🛒 Cart items loaded:", cartItems)
        dispatch({ type: "LOAD_CART", payload: cartItems })
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      }
    } else {
      console.log("🛒 No saved cart found in localStorage")
    }
  }, [isClient])

  // Save cart to localStorage whenever it changes (only on client)
  useEffect(() => {
    if (!isClient) return
    
    console.log("🛒 Saving cart to localStorage:", state.items)
    localStorage.setItem("para-bell-cart", JSON.stringify(state.items))
  }, [state.items, isClient])

  const addItem = (product: Product, quantity = 1) => {
    console.log("🛒 Adding item to cart:", product.name, "quantity:", quantity)
    dispatch({ type: "ADD_ITEM", payload: { product, quantity } })
    
    // Track AddToCart event with Meta Pixel
    metaPixelEvents.trackAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency,
      quantity: quantity,
      category: (product as any)?.category?.name,
      brand: product.brand.name,
    })
  }

  const removeItem = (productId: string) => {
    // Find the item being removed to track it
    const itemToRemove = state.items.find(item => item.product.id === productId)
    
    dispatch({ type: "REMOVE_ITEM", payload: { productId } })
    
    // Track RemoveFromCart event with Meta Pixel
    if (itemToRemove) {
      metaPixelEvents.trackRemoveFromCart({
        id: itemToRemove.product.id,
        name: itemToRemove.product.name,
        price: itemToRemove.product.price,
        currency: itemToRemove.product.currency,
        quantity: itemToRemove.quantity,
        category: (itemToRemove.product as any)?.category?.name,
        brand: itemToRemove.product.brand.name,
      })
    }
  }

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  const trackCheckoutInitiation = () => {
    if (state.items.length > 0) {
      const cartItems = state.items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        category: (item.product as any)?.category?.name,
        brand: item.product.brand.name,
      }))

      metaPixelEvents.trackInitiateCheckout(
        cartItems,
        state.total,
        state.items[0]?.product.currency || 'TND'
      )
    }
  }

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        trackCheckoutInitiation,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
