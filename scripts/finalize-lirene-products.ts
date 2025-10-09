import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Missing products that need to be added
const missingProducts = [
  { name: 'Crème Hydratante (Peaux Sèches & Hypersensibles)', category: 'ACIDE POWER' },
  { name: 'Masque sous forme de Chaussettes (Lissant)', category: 'SOIN INTENSE (Mains & Pieds)' },
  { name: 'Eau Micellaire Apaisante à l\'aloe Vera', category: 'NETTOYANTS (Visage&Yeux)' },
  { name: 'Lotion Tonifiante Hydratante à base d\'Aloe vera & Concombre', category: 'NETTOYANTS (Visage&Yeux)' },
  { name: 'Pâte d\'Argile Nettoyante', category: 'NETTOYANTS (Visage&Yeux)' }
]

async function finalizeLireneProducts() {
  console.log('🔧 Finalizing Lirene products...')
  
  // Find Lirene brand
  const lireneBrand = await prisma.brand.findFirst({
    where: {
      name: {
        contains: 'Lirene',
        mode: 'insensitive'
      }
    }
  })
  
  if (!lireneBrand) {
    console.log('❌ Lirene brand not found in database')
    return
  }
  
  // Remove duplicate products first
  const allProducts = await prisma.product.findMany({
    where: {
      brand_id: lireneBrand.id
    },
    include: {
      category: true
    }
  })
  
  // Find and remove duplicates
  const productGroups: { [key: string]: any[] } = {}
  
  for (const product of allProducts) {
    const baseName = product.name.split('(')[0].trim()
    if (!productGroups[baseName]) {
      productGroups[baseName] = []
    }
    productGroups[baseName].push(product)
  }
  
  let deletedDuplicates = 0
  
  for (const [baseName, products] of Object.entries(productGroups)) {
    if (products.length > 1) {
      console.log(`🔄 Found duplicates for "${baseName}": ${products.length} products`)
      
      // Keep the first one, delete the rest
      const keepProduct = products[0]
      const deleteProducts = products.slice(1)
      
      for (const product of deleteProducts) {
        try {
          console.log(`🗑️ Deleting duplicate: ${product.name}`)
          
          // Delete related records first
          await prisma.cartItem.deleteMany({ where: { product_id: product.id } })
          await prisma.orderItem.deleteMany({ where: { product_id: product.id } })
          await prisma.review.deleteMany({ where: { product_id: product.id } })
          
          // Delete the product
          await prisma.product.delete({
            where: { id: product.id }
          })
          
          deletedDuplicates++
        } catch (error) {
          console.log(`❌ Error deleting ${product.name}:`, error.message)
        }
      }
    }
  }
  
  console.log(`🗑️ Deleted ${deletedDuplicates} duplicate products`)
  
  // Add missing products
  let addedCount = 0
  
  for (const missingProduct of missingProducts) {
    try {
      // Check if product already exists
      const existingProduct = await prisma.product.findFirst({
        where: {
          name: missingProduct.name,
          brand_id: lireneBrand.id
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
          brand_id: lireneBrand.id
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
      
      const sku = `LR-${missingProduct.name.split(' ').slice(0, 2).map(w => w.charAt(0)).join('')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
      
      const newProduct = await prisma.product.create({
        data: {
          name: missingProduct.name,
          slug: slug,
          sku: sku,
          brand_id: lireneBrand.id,
          category_id: category.id,
          price: 25.00, // Default price
          currency: 'EUR',
          short_description: `Produit ${missingProduct.name} de la marque Lirene`,
          description: `Découvrez ${missingProduct.name}, un produit de qualité supérieure de la marque Lirene.`,
          is_active: true,
          stock_quantity: 100,
          track_inventory: true,
          images: [],
          attributes: {},
          badges: ['Made in France', 'Qualité Lirene'],
          tags: [missingProduct.category.toLowerCase()],
          seo: {
            title: `${missingProduct.name} - Lirene | Para Bell`,
            description: `Achetez ${missingProduct.name} de Lirene sur Para Bell. Qualité garantie et livraison rapide.`
          }
        }
      })
      
      console.log(`➕ Added: ${missingProduct.name} (ID: ${newProduct.id})`)
      addedCount++
    } catch (error) {
      console.log(`❌ Error adding ${missingProduct.name}:`, error.message)
    }
  }
  
  console.log(`\n➕ Added ${addedCount} missing products`)
  
  // Final verification
  const finalProducts = await prisma.product.findMany({
    where: {
      brand_id: lireneBrand.id
    },
    include: {
      category: true
    },
    orderBy: {
      name: 'asc'
    }
  })
  
  console.log(`\n📦 Final Lirene products: ${finalProducts.length}`)
  console.log('\n📋 Final product list by category:')
  
  const categories = ['PROTECTION SOLAIRE', 'GELS POUR L\'HYGIÈNE INTIME', 'AQUA BUBBLES', 'ACIDE POWER', 'MEZO COLLAGÈNE', 'VEGAN (Hydratation&Nutrition)', 'SOIN INTENSE (Mains & Pieds)', 'NETTOYANTS (Visage&Yeux)', 'VITAMIN ENERGIE C+D']
  
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

finalizeLireneProducts().catch(console.error)
