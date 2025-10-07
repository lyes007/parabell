import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { OrderSuccessContent } from "@/components/order-success-content"

export const metadata = {
  title: "Order Confirmed - Para Bell",
  description: "Your order has been successfully placed and confirmed.",
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <OrderSuccessContent />
      </main>
      <Footer />
    </div>
  )
}
