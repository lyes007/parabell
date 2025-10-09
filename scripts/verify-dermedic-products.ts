import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Products that should exist (from your list)
const requiredProducts = [
  // NORMACNE
  'Gel Nettoyant Antibactérien (200 ml)',
  'Gel Nettoyant Antibactérien (500 ml)',
  'Crème Hydratante Matifiante',
  'Stop Boutons',
  'Crème de Nuit Anti-Imperfections',
  
  // OILAGE
  'Crème de Jour Nourrissante',
  'Crème de Nuit Rèparatrice',
  'Huile Nettoyante Visage',
  'Crème Concentrée Anti Rides (Yeux)',
  'Sérum Antioxydant',
  
  // CAPILARTE
  'Shampoing Sebu-Balance',
  'Shampoing Anti-Chute et Repousse',
  'Sérum Anti-Chute et Repousse',
  'Shampoing Anti-chute pour cheveux Fins',
  'Shampoing Anti-Pelliculaire',
  'Shampoing Apaisant',
  
  // SUNBRELLA
  'Crème protectrice FPS 50+ peaux grasses et mixtes',
  'Crème protectrice FPS 50+ Peaux sèches et normales',
  'Spray protecteur FPS 50+ UVA + UVB + VL + IR',
  'Lait protecteur en spray SPF 50+',
  
  // MELUMIN
  'Émulsion micellaire éclaircissante',
  'Crème de Jour intense Anti-Tâches SPF 50+',
  'Crème de nuit concentrée Anti-Tâches',
  
  // HYDRAIN
  'Gel Nettoyant Crèmeux',
  'Eau micellaire démaquillante (visage&yeux) - 500 ml',
  'Eau micellaire démaquillante (visage&yeux) - 200 ml',
  'Contour des Yeux',
  'Crème Hydratante SPF 15',
  'Crème Gel Ultra-hydratante',
  'Sérum hydratant',
  'Peeling Enzymatique',
  'Crème de Nuit',
  'Beurre Ultra Hydratant'
]

async function verifyDermedicProducts() {
  console.log('🔍 Verifying Dermedic products against required list...')
  
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
  console.log(`📋 Required products: ${requiredProducts.length}`)
  
  let foundCount = 0
  let missingCount = 0
  let extraCount = 0
  
  const foundProducts: string[] = []
  const missingProducts: string[] = []
  const extraProducts: string[] = []
  
  // Check which required products are found
  for (const requiredProduct of requiredProducts) {
    const found = currentProducts.find(p => 
      p.name.toLowerCase().includes(requiredProduct.toLowerCase()) ||
      requiredProduct.toLowerCase().includes(p.name.toLowerCase()) ||
      // Handle special cases with slight name differences
      (requiredProduct.includes('(200 ml)') && p.name.includes('Gel Nettoyant Antibactérien') && !p.name.includes('(500 ml)')) ||
      (requiredProduct.includes('(500 ml)') && p.name.includes('Gel Nettoyant Antibactérien') && !p.name.includes('(200 ml)')) ||
      (requiredProduct.includes('(visage&yeux) - 500 ml') && p.name.includes('Eau micellaire démaquillante') && !p.name.includes('(200 ml)')) ||
      (requiredProduct.includes('(visage&yeux) - 200 ml') && p.name.includes('Eau micellaire démaquillante') && !p.name.includes('(500 ml)'))
    )
    
    if (found) {
      foundProducts.push(requiredProduct)
      foundCount++
    } else {
      missingProducts.push(requiredProduct)
      missingCount++
    }
  }
  
  // Check for extra products not in the required list
  for (const product of currentProducts) {
    const isInRequiredList = requiredProducts.some(required => 
      product.name.toLowerCase().includes(required.toLowerCase()) ||
      required.toLowerCase().includes(product.name.toLowerCase()) ||
      // Handle special cases
      (required.includes('(200 ml)') && product.name.includes('Gel Nettoyant Antibactérien') && !product.name.includes('(500 ml)')) ||
      (required.includes('(500 ml)') && product.name.includes('Gel Nettoyant Antibactérien') && !product.name.includes('(200 ml)')) ||
      (required.includes('(visage&yeux) - 500 ml') && product.name.includes('Eau micellaire démaquillante') && !product.name.includes('(200 ml)')) ||
      (required.includes('(visage&yeux) - 200 ml') && product.name.includes('Eau micellaire démaquillante') && !product.name.includes('(500 ml)'))
    )
    
    if (!isInRequiredList) {
      extraProducts.push(product.name)
      extraCount++
    }
  }
  
  console.log('\n📊 VERIFICATION SUMMARY:')
  console.log(`✅ Found: ${foundCount} products`)
  console.log(`❌ Missing: ${missingCount} products`)
  console.log(`➕ Extra: ${extraCount} products`)
  
  if (missingProducts.length > 0) {
    console.log('\n❌ Missing products:')
    missingProducts.forEach(product => {
      console.log(`  - ${product}`)
    })
  }
  
  if (extraProducts.length > 0) {
    console.log('\n➕ Extra products:')
    extraProducts.forEach(product => {
      console.log(`  - ${product}`)
    })
  }
  
  // Display current products by category
  console.log('\n📂 Current products by category:')
  const categories = ['NORMACNE', 'OILAGE', 'CAPILARTE', 'SUNBRELLA', 'MELUMIN', 'HYDRAIN']
  
  for (const categoryName of categories) {
    const categoryProducts = currentProducts.filter(p => p.category?.name === categoryName)
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

verifyDermedicProducts().catch(console.error)
