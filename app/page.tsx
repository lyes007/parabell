import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { PackSerenitySection } from "@/components/pack-serenity-section"
import { HairLossProductSection } from "@/components/hair-loss-product-section"
import { TrendingProductsSection } from "@/components/trending-products-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <PackSerenitySection />
      <TrendingProductsSection />
      <HairLossProductSection />
      <Footer />
    </main>
  )
}
