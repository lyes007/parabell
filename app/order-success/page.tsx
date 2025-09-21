import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Package, Mail, ArrowRight } from "lucide-react"

export const metadata = {
  title: "Order Confirmed - Para Bell",
  description: "Your order has been successfully placed and confirmed.",
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for your order. We've received your payment and will start processing your order right away.
          </p>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <Mail className="w-8 h-8 text-[#96A78D] mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Confirmation Email</h3>
                  <p className="text-sm text-gray-600">Check your email for order details and tracking information</p>
                </div>
                <div>
                  <Package className="w-8 h-8 text-[#96A78D] mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Processing</h3>
                  <p className="text-sm text-gray-600">Your order will be processed within 24 hours</p>
                </div>
                <div>
                  <CheckCircle className="w-8 h-8 text-[#96A78D] mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Delivery</h3>
                  <p className="text-sm text-gray-600">Estimated delivery in 2-5 business days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-[#96A78D] hover:bg-[#B6CEB4] text-white">
              <Link href="/products">
                Continue Shopping
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
