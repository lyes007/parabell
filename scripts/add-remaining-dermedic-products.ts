import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Remaining missing products
const missingProducts = [
  { name: 'Contour des Yeux', category: 'HYDRAIN' },
  { name: 'Peeling Enzymatique', category: 'HYDRAIN' },
  { name: 'Gel Nettoyant Antibactérien (500 ml)', category: 'NORMACNE' },
  { name: 'Eau micellaire démaquillante (visage&yeux) - 200 ml', category: 'HYDRAIN' },
  { name: 'Crème de Nuit', category: 'HYDRAIN' }
]

async function addRemainingDermedicProducts() {
  console.log('➕ Adding remaining Dermedic products...')
  
  // Find Dermedic brand
  const dermedicBrand = await prisma.brand.findFirst({
    where: {
      name: {
        contains: 'Dermedic',
        mode: 'insensitive'
      }
    }
  })
  
  if (!dermedicBrand) {
    console.log('❌ Dermedic brand not found in database')
    return
  }
  
  let addedCount = 0
  
  for (const missingProduct of missingProducts) {
    try {
      // Check if product already exists
      const existingProduct = await prisma.product.findFirst({
        where: {
          name: missingProduct.name,
          brand_id: dermedicBrand.id
        }
      })
      
      if (existingProduct) {
        console.log(`✅ Already exists: ${missingProduct.name}`)
        continue
      }
      
      // Find the category
      const category = await prisma.category.findFirst({
        where: {
          name: missingProduct.category,
          brand_id: dermedicBrand.id
        }
      })
      
      if (!category) {
        console.log(`❌ Category not found: ${missingProduct.category}`)
        continue
      }
      
      // Create unique slug
      let slug = missingProduct.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      
      // Ensure slug is unique
      let counter = 1
      let originalSlug = slug
      while (await prisma.product.findFirst({ where: { slug } })) {
        slug = `${originalSlug}-${counter}`
        counter++
      }
      
      // Create unique SKU
      const sku = `DM-${missingProduct.name.split(' ').slice(0, 2).map(w => w.charAt(0)).join('')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
      
      const newProduct = await prisma.product.create({
        data: {
          name: missingProduct.name,
          slug: slug,
          sku: sku,
          brand_id: dermedicBrand.id,
          category_id: category.id,
          price: 30.00, // Default price
          currency: 'EUR',
          short_description: `Produit ${missingProduct.name} de la marque Dermedic`,
          description: `Découvrez ${missingProduct.name}, un produit de qualité supérieure de la marque Dermedic.`,
          is_active: true,
          stock_quantity: 100,
          track_inventory: true,
          images: [],
          attributes: {},
          badges: ['Made in France', 'Qualité Dermedic'],
          tags: [missingProduct.category.toLowerCase()],
          seo: {
            title: `${missingProduct.name} - Dermedic | Para Bell`,
            description: `Achetez ${missingProduct.name} de Dermedic sur Para Bell. Qualité garantie et livraison rapide.`
          }
        }
      })
      
      console.log(`➕ Added: ${missingProduct.name} (ID: ${newProduct.id})`)
      addedCount++
    } catch (error) {
      console.log(`❌ Error adding ${missingProduct.name}:`, error.message)
    }
  }
  
  console.log(`\n➕ Added ${addedCount} products`)
  
  // Final verification
  const finalProducts = await prisma.product.findMany({
    where: {
      brand_id: dermedicBrand.id
    },
    include: {
      category: true
    },
    orderBy: {
      name: 'asc'
    }
  })
  
  console.log(`\n📦 Final Dermedic products: ${finalProducts.length}`)
  console.log('\n📋 Final product list by category:')
  
  const categories = ['NORMACNE', 'OILAGE', 'CAPILARTE', 'SUNBRELLA', 'MELUMIN', 'HYDRAIN']
  
  for (const categoryName of categories) {
    const categoryProducts = finalProducts.filter(p => p.category?.name === categoryName)
    console.log(`\n${categoryName}:`)
    if (categoryProducts.length === 0) {
      console.log('  (No products)')
    } else {
      categoryProducts.forEach(product => {
        console.log(`  - ${product.name}`)
      })
    }
  }
  
  await prisma.$disconnect()
}

addRemainingDermedicProducts().catch(console.error)
