import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Products from GAMME F - Fluid Fondation CSV
const gammeFProducts = [
  {
    name: 'Fluide protecteur et correcteur la plus haute protection spf 50+ – Correction solaire 02 Ivoire 30 ml',
    description: 'Fluide recommandé pour tous les types de peau, y compris hypersensible et irritée en raison de facteurs externes (photoallergies) et de facteurs mécaniques: après les traitements de médecine esthétique, les lasers et les peelings. Recommandé pour les personnes ayant une tendance à la décoloration de la peau et vulnérables à leur formation (par exemple lors de la prise de médicaments, des changements inflammatoires, de la grossesse) et des personnes aux prises avec le problème de l\'albinisme.',
    image: 'https://www.gssante.com/MtdGssante/uploads/2020/06/02modif.jpg'
  },
  {
    name: 'Fluide protecteur-correctif haute protection spf 50+ – Correction solaire 01 Sable 30 ml',
    description: 'Fluide recommandé pour tous les types de peau, y compris hypersensible et irritée en raison de facteurs externes (photoallergies) et de facteurs mécaniques: après les traitements de médecine esthétique, les lasers et les peelings. Recommandé pour les personnes ayant une tendance à la décoloration de la peau et vulnérables à leur formation (par exemple lors de la prise de médicaments, des changements inflammatoires, de la grossesse) et des personnes aux prises avec le problème de l\'albinisme.',
    image: 'https://www.gssante.com/MtdGssante/uploads/2020/06/01modif.jpg'
  }
]

async function addPharmacerisGammeFProducts() {
  console.log('📄 Adding GAMME F - Fluid Fondation products...')
  
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
  
  // Find or create GAMME F category
  let category = await prisma.category.findFirst({
    where: {
      name: 'GAMME F - Fluid Fondation',
      brand_id: pharmacerisBrand.id
    }
  })
  
  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'GAMME F - Fluid Fondation',
        slug: 'gamme-f-fluid-fondation',
        description: 'Fluide protecteur et correcteur haute protection',
        is_active: true,
        sort_order: 9,
        brand_id: pharmacerisBrand.id
      }
    })
    console.log(`➕ Created category: GAMME F - Fluid Fondation`)
  }
  
  // Get current products to check for duplicates
  const currentProducts = await prisma.product.findMany({
    where: {
      brand_id: pharmacerisBrand.id
    },
    select: {
      name: true
    }
  })
  
  const currentProductNames = currentProducts.map(p => p.name.toLowerCase())
  
  let addedCount = 0
  
  for (const productData of gammeFProducts) {
    // Check if product already exists
    const exists = currentProductNames.some(name => 
      name.includes(productData.name.toLowerCase()) || 
      productData.name.toLowerCase().includes(name)
    )
    
    if (exists) {
      console.log(`✅ Already exists: ${productData.name}`)
      continue
    }
    
    // Create product
    const slug = productData.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    
    const sku = `PC-F-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
    
    try {
      const newProduct = await prisma.product.create({
        data: {
          name: productData.name,
          slug: slug,
          sku: sku,
          brand_id: pharmacerisBrand.id,
          category_id: category.id,
          price: 40.00,
          currency: 'EUR',
          short_description: `Produit ${productData.name} de la marque Pharmaceris`,
          description: productData.description,
          is_active: true,
          stock_quantity: 100,
          track_inventory: true,
          images: productData.image ? [productData.image] : [],
          attributes: {},
          badges: ['Made in France', 'Qualité Pharmaceris'],
          tags: ['gamme-f', 'fluid-fondation'],
          seo: {
            title: `${productData.name} - Pharmaceris | Para Bell`,
            description: `Achetez ${productData.name} de Pharmaceris sur Para Bell. Qualité garantie et livraison rapide.`
          }
        }
      })
      
      console.log(`➕ Added: ${productData.name} (ID: ${newProduct.id})`)
      addedCount++
    } catch (error) {
      console.log(`❌ Error adding ${productData.name}:`, error.message)
    }
  }
  
  console.log(`\n📊 SUMMARY:`)
  console.log(`➕ Added ${addedCount} new products`)
  
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
  
  // Show GAMME F products
  const gammeFProductsFinal = finalProducts.filter(p => p.category?.name === 'GAMME F - Fluid Fondation')
  console.log(`\nGAMME F - Fluid Fondation (${gammeFProductsFinal.length} products):`)
  gammeFProductsFinal.forEach(product => {
    console.log(`  - ${product.name}`)
  })
  
  await prisma.$disconnect()
}

addPharmacerisGammeFProducts().catch(console.error)
