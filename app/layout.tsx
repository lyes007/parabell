import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import Script from "next/script"
import { CartProvider } from "@/lib/cart-context"
import { MetaPixel } from "@/components/meta-pixel"
import "./globals.css"
import { Dancing_Script } from "next/font/google"

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing-script",
  display: "swap",
})

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
      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-MDQVT6PGJ3" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-MDQVT6PGJ3');
          `}
        </Script>
        <Script id="matomo-tag-manager" strategy="afterInteractive">
          {`
            var _mtm = (window._mtm = window._mtm || []);
            _mtm.push({ 'mtm.startTime': new Date().getTime(), event: 'mtm.Start' });
          `}
        </Script>
        <Script
          async
          src="https://cdn.matomo.cloud/parabellestore.matomo.cloud/container_PKULEiu5.js"
          strategy="afterInteractive"
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${dancingScript.variable}`}>
        {pixelId && <MetaPixel pixelId={pixelId} />}
        <CartProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
