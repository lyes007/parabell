import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { CartProvider } from "@/lib/cart-context"
import { MetaPixel } from "@/components/meta-pixel"
import "./globals.css"

export const metadata: Metadata = {
  title: "Para Bell - Premium Health & Wellness Products",
  description:
    "Discover premium supplements, skincare, and wellness products from trusted brands. Expert advice and quality guaranteed for your health journey.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID

  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {pixelId && <MetaPixel pixelId={pixelId} />}
        <CartProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
