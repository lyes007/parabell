import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function CategoryShowcase() {
  const categories = [
    {
      name: "Vitamins & Supplements",
      description: "Essential nutrients for optimal health",
      image: "/vitamin-bottles-supplements-colorful-modern.jpg",
      href: "/categories/vitamins",
      color: "from-[#D9E9CF] to-[#B6CEB4]/20",
    },
    {
      name: "Skincare & Beauty",
      description: "Premium skincare for healthy, glowing skin",
      image: "/skincare-products-bottles-serums-clean-modern.jpg",
      href: "/categories/skincare",
      color: "from-[#F0F0F0] to-[#B6CEB4]/20",
    },
    {
      name: "Wellness & Fitness",
      description: "Support your active lifestyle",
      image: "/wellness-fitness-supplements-protein-powder-modern.jpg",
      href: "/categories/wellness",
      color: "from-[#D9E9CF] to-[#96A78D]/20",
    },
    {
      name: "Baby & Mother Care",
      description: "Gentle care for mothers and babies",
      image: "/baby-care-products-mother-child-health-gentle.jpg",
      href: "/categories/baby",
      color: "from-[#F0F0F0] to-[#96A78D]/20",
    },
  ]

  return (
    <section className="py-16 bg-[#F7F9FA]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find exactly what you need for your health and wellness journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link
              key={index}
              href={category.href}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className={`aspect-[4/3] bg-gradient-to-br ${category.color} p-6 flex items-center justify-center`}>
                <img
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#96A78D] transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                <div className="flex items-center text-[#96A78D] text-sm font-medium">
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
