import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Missing products that need to be added
const missingProducts = [
  { name: 'Gel Nettoyant Crèmeux', category: 'HYDRAIN' },
  { name: 'Contour des Yeux', category: 'HYDRAIN' },
  { name: 'Peeling Enzymatique', category: 'HYDRAIN' }
]

async function cleanupDermedicProducts() {
  console.log('🧹 Cleaning up Dermedic products...')
  
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
  
  // Get all current Dermedic products
  const currentProducts = await prisma.product.findMany({
    where: {
      brand_id: dermedicBrand.id
    },
    include: {
      category: true
    }
  })
  
  console.log(`📦 Current Dermedic products: ${currentProducts.length}`)
  
  let deletedCount = 0
  let addedCount = 0
  let updatedCount = 0
  
  // Remove extra products (like "qsdf")
  for (const product of currentProducts) {
    if (product.name === 'qsdf') {
      try {
        console.log(`🗑️ Deleting extra product: ${product.name}`)
        
        // Delete related records first
        await prisma.cartItem.deleteMany({ where: { product_id: product.id } })
        await prisma.orderItem.deleteMany({ where: { product_id: product.id } })
        await prisma.review.deleteMany({ where: { product_id: product.id } })
        
        // Delete the product
        await prisma.product.delete({
          where: { id: product.id }
        })
        
        deletedCount++
      } catch (error) {
        console.log(`❌ Error deleting ${product.name}:`, error.message)
      }
    }
  }
  
  // Update product names to match exact specifications
  const nameUpdates = [
    { current: 'Gel Nettoyant Antibactérien', new: 'Gel Nettoyant Antibactérien (200 ml)' },
    { current: 'Eau micellaire démaquillante (visage&yeux)', new: 'Eau micellaire démaquillante (visage&yeux) - 500 ml' }
  ]
  
  for (const update of nameUpdates) {
    const product = currentProducts.find(p => p.name === update.current)
    if (product) {
      try {
        await prisma.product.update({
          where: { id: product.id },
          data: { name: update.new }
        })
        console.log(`📝 Updated: "${update.current}" → "${update.new}"`)
        updatedCount++
      } catch (error) {
        console.log(`❌ Error updating ${update.current}:`, error.message)
      }
    }
  }
  
  // Add missing products
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
      
      // Create the product
      const slug = missingProduct.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      
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
  
  console.log('\n📊 CLEANUP SUMMARY:')
  console.log(`🗑️ Deleted: ${deletedCount} products`)
  console.log(`📝 Updated: ${updatedCount} products`)
  console.log(`➕ Added: ${addedCount} products`)
  
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

cleanupDermedicProducts().catch(console.error)
