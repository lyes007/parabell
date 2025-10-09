import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Products that should exist (from your list)
const requiredProducts = [
  // BEAUTÉ
  { name: 'Expert Hyaluronic', category: 'BEAUTÉ' },
  { name: 'Expert Collagène', category: 'BEAUTÉ' },
  { name: 'Expert Cheveux', category: 'BEAUTÉ' },
  
  // ENERGIE
  { name: 'Ultra boost 4g (effervescent)', category: 'ENERGIE' },
  { name: 'Ultra boost 4G', category: 'ENERGIE' },
  { name: 'Vitalité 4g shots', category: 'ENERGIE' },
  { name: 'Tigra+ Men', category: 'ENERGIE' },
  { name: 'Acerola Vitamine C', category: 'ENERGIE' },
  { name: 'Multivit\'Kids', category: 'ENERGIE' },
  
  // SANTÉ
  { name: 'Forté Flex Max Articulations', category: 'SANTÉ' },
  { name: 'Forté Stresse 24H', category: 'SANTÉ' },
  
  // MINCEUR
  { name: 'Calorilight', category: 'MINCEUR' },
  { name: 'Xtraslim 700', category: 'MINCEUR' },
  { name: 'Turbodraine AGRUMES', category: 'MINCEUR' },
  { name: 'Turbodraine ANANAS', category: 'MINCEUR' },
  { name: 'Turbodraine FRAMBOISE', category: 'MINCEUR' },
  { name: 'Turbodraine PÊCHE', category: 'MINCEUR' },
  { name: 'XtraSlim Capteur 3 en 1', category: 'MINCEUR' },
  { name: 'XtraSlim Coupe-Faim', category: 'MINCEUR' },
  { name: 'Rétention d\'eau', category: 'MINCEUR' }
]

async function addMissingProducts() {
  console.log('➕ Adding missing products...')
  
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
  
  // Get all current Forte Pharma products
  const currentProducts = await prisma.product.findMany({
    where: {
      brand_id: fortePharmaBrand.id
    }
  })
  
  console.log(`📦 Current Forte Pharma products: ${currentProducts.length}`)
  
  let addedCount = 0
  let existingCount = 0
  
  for (const requiredProduct of requiredProducts) {
    // Check if this product already exists
    const exists = currentProducts.some(p => 
      p.name.toLowerCase().includes(requiredProduct.name.toLowerCase()) ||
      requiredProduct.name.toLowerCase().includes(p.name.toLowerCase())
    )
    
    if (exists) {
      console.log(`✅ Already exists: ${requiredProduct.name}`)
      existingCount++
    } else {
      try {
        // Find the category
        const category = await prisma.category.findFirst({
          where: {
            name: requiredProduct.category,
            brand_id: fortePharmaBrand.id
          }
        })
        
        if (!category) {
          console.log(`❌ Category not found: ${requiredProduct.category}`)
          continue
        }
        
        // Create the product
        const slug = requiredProduct.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()
        
        const sku = `FP-${requiredProduct.name.split(' ').map(w => w.charAt(0)).join('')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
        
        const newProduct = await prisma.product.create({
          data: {
            name: requiredProduct.name,
            slug: slug,
            sku: sku,
            brand_id: fortePharmaBrand.id,
            category_id: category.id,
            price: 50.00, // Default price
            currency: 'EUR',
            short_description: `Produit ${requiredProduct.name} de la marque Forte Pharma`,
            description: `Découvrez ${requiredProduct.name}, un complément alimentaire de qualité supérieure de la marque Forte Pharma.`,
            is_active: true,
            stock_quantity: 100,
            track_inventory: true,
            images: [],
            attributes: {},
            badges: ['Made in France', 'Qualité Forte Pharma'],
            tags: [requiredProduct.category.toLowerCase()],
            seo: {
              title: `${requiredProduct.name} - Forte Pharma | Para Bell`,
              description: `Achetez ${requiredProduct.name} de Forte Pharma sur Para Bell. Qualité garantie et livraison rapide.`
            }
          }
        })
        
        console.log(`➕ Added: ${requiredProduct.name} (ID: ${newProduct.id})`)
        addedCount++
      } catch (error) {
        console.log(`❌ Error adding ${requiredProduct.name}:`, error.message)
      }
    }
  }
  
  console.log('\n📊 ADDITION SUMMARY:')
  console.log(`✅ Already existed: ${existingCount} products`)
  console.log(`➕ Added: ${addedCount} products`)
  
  // Final verification
  const finalProducts = await prisma.product.findMany({
    where: {
      brand_id: fortePharmaBrand.id
    },
    include: {
      category: true
    },
    orderBy: {
      name: 'asc'
    }
  })
  
  console.log(`\n📦 Final Forte Pharma products: ${finalProducts.length}`)
  console.log('\n📋 Final product list by category:')
  
  const categories = ['BEAUTÉ', 'ENERGIE', 'SANTÉ', 'MINCEUR']
  
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

addMissingProducts().catch(console.error)
