import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addUltraBoostEffervescent() {
  console.log('➕ Adding Ultra boost 4g (effervescent)...')
  
  // Find Forte Pharma brand
  const fortePharmaBrand = await prisma.brand.findFirst({
    where: {
      name: {
        contains: 'Forte Pharma',
        mode: 'insensitive'
      }
    }
  })
  
  if (!fortePharmaBrand) {
    console.log('❌ Forte Pharma brand not found in database')
    return
  }
  
  // Find ENERGIE category
  const energieCategory = await prisma.category.findFirst({
    where: {
      name: 'ENERGIE',
      brand_id: fortePharmaBrand.id
    }
  })
  
  if (!energieCategory) {
    console.log('❌ ENERGIE category not found')
    return
  }
  
  // Check if product already exists
  const existingProduct = await prisma.product.findFirst({
    where: {
      name: 'Ultra boost 4g (effervescent)',
      brand_id: fortePharmaBrand.id
    }
  })
  
  if (existingProduct) {
    console.log('✅ Product already exists')
    return
  }
  
  // Create the product
  const newProduct = await prisma.product.create({
    data: {
      name: 'Ultra boost 4g (effervescent)',
      slug: 'ultra-boost-4g-effervescent',
      sku: 'FP-UB4E-001',
      brand_id: fortePharmaBrand.id,
      category_id: energieCategory.id,
      price: 45.00,
      currency: 'EUR',
      short_description: 'Ultra boost 4g (effervescent) - Complément alimentaire énergisant',
      description: 'Découvrez Ultra boost 4g (effervescent), un complément alimentaire de qualité supérieure de la marque Forte Pharma pour booster votre énergie.',
      is_active: true,
      stock_quantity: 100,
      track_inventory: true,
      images: [],
      attributes: {},
      badges: ['Made in France', 'Qualité Forte Pharma'],
      tags: ['energie', 'effervescent'],
      seo: {
        title: 'Ultra boost 4g (effervescent) - Forte Pharma | Para Bell',
        description: 'Achetez Ultra boost 4g (effervescent) de Forte Pharma sur Para Bell. Qualité garantie et livraison rapide.'
      }
    }
  })
  
  console.log(`✅ Added: ${newProduct.name} (ID: ${newProduct.id})`)
  
  // Final verification
  const finalProducts = await prisma.product.findMany({
    where: {
      brand_id: fortePharmaBrand.id,
      category: {
        name: 'ENERGIE'
      }
    },
    include: {
      category: true
    },
    orderBy: {
      name: 'asc'
    }
  })
  
  console.log('\n📋 ENERGIE category products:')
  finalProducts.forEach(product => {
    console.log(`  - ${product.name}`)
  })
  
  await prisma.$disconnect()
}

addUltraBoostEffervescent().catch(console.error)
