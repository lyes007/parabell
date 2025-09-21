import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create brands
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: 'vitamin-d3' },
      update: {},
      create: {
        name: 'Vitamin D3',
        slug: 'vitamin-d3',
        description: 'Premium vitamin D3 supplements for optimal health',
        logo_url: '/placeholder-logo.svg',
        is_active: true,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'omega-3' },
      update: {},
      create: {
        name: 'Omega 3',
        slug: 'omega-3',
        description: 'High-quality omega-3 fatty acid supplements',
        logo_url: '/placeholder-logo.svg',
        is_active: true,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'multivitamin' },
      update: {},
      create: {
        name: 'Multivitamin',
        slug: 'multivitamin',
        description: 'Complete multivitamin formulas for daily nutrition',
        logo_url: '/placeholder-logo.svg',
        is_active: true,
      },
    }),
  ])

  console.log(`✅ Created ${brands.length} brands`)

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'vitamins' },
      update: {},
      create: {
        name: 'Vitamins',
        slug: 'vitamins',
        description: 'Essential vitamins for daily health',
        image_url: '/vitamin-bottles-supplements-colorful-modern.jpg',
        is_active: true,
        sort_order: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'supplements' },
      update: {},
      create: {
        name: 'Supplements',
        slug: 'supplements',
        description: 'Health supplements and wellness products',
        image_url: '/wellness-fitness-supplements-protein-powder-modern.jpg',
        is_active: true,
        sort_order: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'skincare' },
      update: {},
      create: {
        name: 'Skincare',
        slug: 'skincare',
        description: 'Natural skincare and beauty products',
        image_url: '/skincare-products-bottles-serums-clean-modern.jpg',
        is_active: true,
        sort_order: 3,
      },
    }),
  ])

  console.log(`✅ Created ${categories.length} categories`)

  // Create sample products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { slug: 'vitamin-d3-1000-iu' },
      update: {},
      create: {
        brand_id: brands[0].id,
        sku: 'VD3-1000',
        slug: 'vitamin-d3-1000-iu',
        name: 'Vitamin D3 1000 IU',
        short_description: 'High-potency vitamin D3 for bone and immune health',
        description: 'Our premium Vitamin D3 supplement provides 1000 IU of cholecalciferol, the most bioavailable form of vitamin D. Essential for bone health, immune function, and overall wellness.',
        highlights: '• 1000 IU per capsule\n• Easy-to-swallow softgels\n• Third-party tested\n• Non-GMO',
        price: 19.99,
        compare_at_price: 24.99,
        currency: 'EUR',
        track_inventory: true,
        stock_quantity: 100,
        inventory_policy: 'deny',
        low_stock_threshold: 10,
        weight_kg: 0.05,
        gtin: '1234567890123',
        ingredients: 'Vitamin D3 (Cholecalciferol), Extra Virgin Olive Oil, Softgel Capsule (Gelatin, Glycerin)',
        dosage: 'Take 1 capsule daily with food',
        directions: 'Swallow whole with water. Do not exceed recommended dose.',
        warnings: 'Keep out of reach of children. Consult your healthcare provider before use.',
        servings_per_container: 60,
        net_content: '60 capsules',
        attributes: {
          potency: '1000 IU',
          form: 'Softgel',
          size: '60 count',
          target: 'Adults'
        },
        nutrition: {
          vitamin_d3: '1000 IU',
          daily_value: '125%'
        },
        badges: ['Non-GMO', 'Third-Party Tested', 'Easy to Swallow'],
        images: [
          '/vitamin-bottles-supplements-colorful-modern.jpg',
          '/placeholder.jpg'
        ],
        video_urls: [],
        seo: {
          title: 'Vitamin D3 1000 IU - Premium Supplement',
          description: 'High-quality vitamin D3 supplement for bone and immune health. 1000 IU per capsule, third-party tested.',
          keywords: ['vitamin d3', 'supplement', 'bone health', 'immune support']
        },
        tags: ['vitamin-d3', 'bone-health', 'immune-support', 'supplements'],
        is_active: true,
        is_featured: true,
        published_at: new Date(),
        available_from: new Date(),
        avg_rating: 4.5,
        reviews_count: 23,
        total_sold: 156,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'omega-3-fish-oil' },
      update: {},
      create: {
        brand_id: brands[1].id,
        sku: 'OM3-1000',
        slug: 'omega-3-fish-oil',
        name: 'Omega 3 Fish Oil',
        short_description: 'Pure fish oil with EPA and DHA for heart and brain health',
        description: 'Our premium fish oil supplement provides high concentrations of EPA and DHA omega-3 fatty acids. Sourced from wild-caught fish and molecularly distilled for purity.',
        highlights: '• 1000mg fish oil per capsule\n• 300mg EPA + 200mg DHA\n• Molecularly distilled\n• Lemon flavored',
        price: 29.99,
        compare_at_price: 34.99,
        currency: 'EUR',
        track_inventory: true,
        stock_quantity: 75,
        inventory_policy: 'deny',
        low_stock_threshold: 10,
        weight_kg: 0.08,
        gtin: '1234567890124',
        ingredients: 'Fish Oil, EPA, DHA, Natural Lemon Flavor, Softgel Capsule',
        dosage: 'Take 2 capsules daily with meals',
        directions: 'Swallow whole with water. Take with food to enhance absorption.',
        warnings: 'If you are pregnant, nursing, or taking medications, consult your healthcare provider.',
        servings_per_container: 30,
        net_content: '60 capsules',
        attributes: {
          epa: '300mg',
          dha: '200mg',
          form: 'Softgel',
          size: '60 count',
          flavor: 'Lemon'
        },
        nutrition: {
          epa: '300mg',
          dha: '200mg',
          total_omega_3: '500mg'
        },
        badges: ['Molecularly Distilled', 'Lemon Flavored', 'High Potency'],
        images: [
          '/wellness-fitness-supplements-protein-powder-modern.jpg',
          '/placeholder.jpg'
        ],
        video_urls: [],
        seo: {
          title: 'Omega 3 Fish Oil - EPA & DHA Supplement',
          description: 'Premium fish oil supplement with EPA and DHA for heart and brain health. Molecularly distilled for purity.',
          keywords: ['omega 3', 'fish oil', 'epa', 'dha', 'heart health']
        },
        tags: ['omega-3', 'fish-oil', 'heart-health', 'brain-health'],
        is_active: true,
        is_featured: true,
        published_at: new Date(),
        available_from: new Date(),
        avg_rating: 4.7,
        reviews_count: 18,
        total_sold: 89,
      },
    }),
  ])

  console.log(`✅ Created ${products.length} products`)

  console.log('🎉 Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
