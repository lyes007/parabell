import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Missing products that need to be added
const missingProducts = [
  { name: 'Crème avec retinol pour l\'acné adulte la nuit PUR-Retinol 0,3 40 ml', category: 'GAMME T - Acnéique' },
  { name: 'Crème Protectrice SPF 50+ Medi-Acné Protect 50ml', category: 'GAMME T - Acnéique' },
  { name: 'Crème protectrice spf 50+ pour l\'acné Medi acne protect 50 ml', category: 'GAMME S - Protection solaire' },
  { name: 'Fluide protecteur-correctif haute protection spf 50+ – Correction solaire 01 Sable 30 ml', category: 'GAMME S - Protection solaire' }
]

async function finalizePharmacerisProducts() {
  console.log('🔧 Finalizing Pharmaceris products...')
  
  // Find Pharmaceris brand
  const pharmacerisBrand = await prisma.brand.findFirst({
    where: {
      name: {
        contains: 'Pharmaceris',
        mode: 'insensitive'
      }
    }
  })
  
  if (!pharmacerisBrand) {
    console.log('❌ Pharmaceris brand not found in database')
    return
  }
  
  // Get all current Pharmaceris products
  const allProducts = await prisma.product.findMany({
    where: {
      brand_id: pharmacerisBrand.id
    },
    include: {
      category: true
    }
  })
  
  // Remove duplicate products
  const productGroups: { [key: string]: any[] } = {}
  
  for (const product of allProducts) {
    // Group by base name (before the product codes)
    const baseName = product.name.split(' ').slice(0, 3).join(' ')
    if (!productGroups[baseName]) {
      productGroups[baseName] = []
    }
    productGroups[baseName].push(product)
  }
  
  let deletedDuplicates = 0
  
  for (const [baseName, products] of Object.entries(productGroups)) {
    if (products.length > 1) {
      console.log(`🔄 Found duplicates for "${baseName}": ${products.length} products`)
      
      // Keep the one with the most complete name (longest), delete the others
      const keepProduct = products.reduce((best, current) => {
        if (current.name.length > best.name.length) return current
        if (current.name.length < best.name.length) return best
        return current.id < best.id ? current : best
      })
      
      console.log(`   ✅ Keeping: ${keepProduct.name}`)
      
      // Delete the others
      for (const product of products) {
        if (product.id !== keepProduct.id) {
          try {
            console.log(`   🗑️ Deleting duplicate: ${product.name}`)
            
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
            console.log(`     ❌ Error deleting ${product.name}:`, error.message)
          }
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
          brand_id: pharmacerisBrand.id
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
          brand_id: pharmacerisBrand.id
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
      const sku = `PC-${missingProduct.name.split(' ').slice(0, 2).map(w => w.charAt(0)).join('')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
      
      const newProduct = await prisma.product.create({
        data: {
          name: missingProduct.name,
          slug: slug,
          sku: sku,
          brand_id: pharmacerisBrand.id,
          category_id: category.id,
          price: 35.00, // Default price
          currency: 'EUR',
          short_description: `Produit ${missingProduct.name} de la marque Pharmaceris`,
          description: `Découvrez ${missingProduct.name}, un produit de qualité supérieure de la marque Pharmaceris.`,
          is_active: true,
          stock_quantity: 100,
          track_inventory: true,
          images: [],
          attributes: {},
          badges: ['Made in France', 'Qualité Pharmaceris'],
          tags: [missingProduct.category.toLowerCase()],
          seo: {
            title: `${missingProduct.name} - Pharmaceris | Para Bell`,
            description: `Achetez ${missingProduct.name} de Pharmaceris sur Para Bell. Qualité garantie et livraison rapide.`
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
      brand_id: pharmacerisBrand.id
    },
    include: {
      category: true
    },
    orderBy: {
      name: 'asc'
    }
  })
  
  console.log(`\n📦 Final Pharmaceris products: ${finalProducts.length}`)
  console.log('\n📋 Final product list by category:')
  
  const categories = ['GAMME W - Anti-Taches', 'GAMME V - Vitiligo', 'GAMME T - Acnéique', 'GAMME S - Protection solaire', 'GAMME P - Psoriasis', 'GAMME H - Cheveux et Cuir chevelu', 'GAMME E - Peau Sèche et Atopique', 'GAMME A - Peau Allergique et Sensible', 'GAMME F - Fluid Fondation']
  
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

finalizePharmacerisProducts().catch(console.error)
