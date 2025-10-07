'use client'

import { useEffect } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    fbq: any
  }
}

interface MetaPixelProps {
  pixelId: string
}

export function MetaPixel({ pixelId }: MetaPixelProps) {
  useEffect(() => {
    // Initialize Meta Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('init', pixelId)
      window.fbq('track', 'PageView')
    }
  }, [pixelId])

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}

// Meta Pixel Event Tracking Functions
export const metaPixelEvents = {
  // Track page views
  trackPageView: () => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView')
    }
  },

  // Track product views
  trackViewContent: (product: {
    id: string
    name: string
    price: number
    currency: string
    category?: string
    brand?: string
  }) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        value: product.price,
        currency: product.currency,
        content_category: product.category,
        brand: product.brand,
      })
    }
  },

  // Track add to cart
  trackAddToCart: (product: {
    id: string
    name: string
    price: number
    currency: string
    quantity: number
    category?: string
    brand?: string
  }) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        value: product.price * product.quantity,
        currency: product.currency,
        content_category: product.category,
        brand: product.brand,
        num_items: product.quantity,
      })
    }
  },

  // Track remove from cart
  trackRemoveFromCart: (product: {
    id: string
    name: string
    price: number
    currency: string
    quantity: number
    category?: string
    brand?: string
  }) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'RemoveFromCart', {
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        value: product.price * product.quantity,
        currency: product.currency,
        content_category: product.category,
        brand: product.brand,
        num_items: product.quantity,
      })
    }
  },

  // Track initiate checkout
  trackInitiateCheckout: (cartItems: Array<{
    id: string
    name: string
    price: number
    quantity: number
    category?: string
    brand?: string
  }>, totalValue: number, currency: string) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_ids: cartItems.map(item => item.id),
        content_type: 'product',
        value: totalValue,
        currency: currency,
        num_items: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        contents: cartItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          item_price: item.price,
          content_name: item.name,
          content_category: item.category,
          brand: item.brand,
        })),
      })
    }
  },

  // Track purchase completion
  trackPurchase: (order: {
    id: string
    total: number
    currency: string
    items: Array<{
      id: string
      name: string
      price: number
      quantity: number
      category?: string
      brand?: string
    }>
  }) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Purchase', {
        content_ids: order.items.map(item => item.id),
        content_type: 'product',
        value: order.total,
        currency: order.currency,
        num_items: order.items.reduce((sum, item) => sum + item.quantity, 0),
        contents: order.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          item_price: item.price,
          content_name: item.name,
          content_category: item.category,
          brand: item.brand,
        })),
        order_id: order.id,
      })
    }
  },

  // Track search
  trackSearch: (searchTerm: string, resultsCount?: number) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Search', {
        search_string: searchTerm,
        content_type: 'product',
        ...(resultsCount && { num_items: resultsCount }),
      })
    }
  },

  // Track lead generation
  trackLead: (value?: number, currency?: string) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Lead', {
        ...(value && { value }),
        ...(currency && { currency }),
      })
    }
  },

  // Track newsletter signup
  trackCompleteRegistration: (method?: string) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'CompleteRegistration', {
        ...(method && { registration_method: method }),
      })
    }
  },

  // Track custom events
  trackCustomEvent: (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackCustom', eventName, parameters)
    }
  },
}

// Hook for easy Meta Pixel integration
export function useMetaPixel() {
  return metaPixelEvents
}
