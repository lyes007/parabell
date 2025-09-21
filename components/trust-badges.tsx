import { Shield, Award, Truck, Clock, Phone, CheckCircle } from "lucide-react"

export function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: "Certified Quality",
      description: "All products meet EU pharmaceutical standards",
    },
    {
      icon: Award,
      title: "Expert Approved",
      description: "Recommended by healthcare professionals",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Free shipping on orders over €50",
    },
    {
      icon: Clock,
      title: "Quick Processing",
      description: "Orders processed within 24 hours",
    },
    {
      icon: Phone,
      title: "24/7 Support",
      description: "Expert advice when you need it",
    },
    {
      icon: CheckCircle,
      title: "Satisfaction Guaranteed",
      description: "30-day money-back guarantee",
    },
  ]

  return (
    <section className="py-16 bg-[#F7F9FA]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Para Bell?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your health deserves the best. We're committed to providing premium products and exceptional service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {badges.map((badge, index) => {
            const Icon = badge.icon
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 bg-[#D9E9CF] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-[#96A78D]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{badge.title}</h3>
                <p className="text-gray-600 text-sm">{badge.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
