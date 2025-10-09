import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Products that should exist (from your list)
const requiredProducts = [
  // PROTECTION SOLAIRE
  'Crème Visage pour Adulte SPF 50+',
  'Lotion Solaire pour peau sensible SPF 50+',
  'Crème Visage pour Enfants SPF 50+',
  'Lait Protecteur SPF50 (Au parfum de Vanille)',
  'SOS : Lotion Après Soleil',
  'Huile Sèche SPF 50 (Sur peau humide et sèche)',
  
  // GELS POUR L'HYGIÈNE INTIME
  'GEL ANTI-INFLAMMATOIRE',
  'GEL PROTECTEUR ET HYDRATANT',
  
  // AQUA BUBBLES
  'EAU TONIQUE',
  'MOUSSE NETTOYANTE',
  'GEL NETTOYANT',
  'HYDROGEL VISAGE JOUR & NUIT(Peau Sèche)',
  'HYDROCRÈME (Peau normale à mixte)',
  'HYDROSERUM (Tous types de peaux)',
  
  // ACIDE POWER
  'Sèrum Exfoliant Anti-Tâches',
  'Crème Hydratante (Peaux Hyperpigmentées & Peaux grasses)',
  'Sèrum Lissant (Peaux Matures)',
  'Crème Comblante (Peaux Matures)',
  'Sèrum Lissant Hydratante (Peaux Sèches & Hypersensibles)',
  'Crème Hydratante (Peaux Sèches & Hypersensibles)',
  
  // MEZO COLLAGÈNE
  'Crème de Jour Liftante',
  'Crème De Nuit',
  
  // VEGAN (Hydratation&Nutrition)
  'Cerise hydratante',
  'Avocat lissant',
  'Aloe Véra – Régénérant',
  'Amande Nourrissante',
  
  // SOIN INTENSE (Mains & Pieds)
  'MAGNOLIA : Crème Mains et Ongles',
  'SAUGE : Masque Crème Mains et Ongles',
  'CASSIS : Sérum Mains et Ongles',
  'ROSE : Crème Mains et Ongles',
  'Crème Pieds Concentrée lissante',
  'Masque Crème Pieds ultra adoucissant',
  'Des Gants pour les Mains',
  'Masque sous forme de Chaussettes (Kératose)',
  'Masque sous forme de Chaussettes (Lissant)',
  
  // NETTOYANTS (Visage&Yeux)
  'Eau Micellaire Apaisante à l\'aloe Vera',
  'Eau micellaire lissante',
  'Lotion Tonifiante Hydratante à base d\'Aloe vera & Concombre',
  'Gel Nettoyant Hydratant',
  'Gel Nettoyant Crémeux',
  'Pâte d\'Argile Nettoyante',
  'Gommage au Bambou',
  'Gel Exfoliant à la Menthe',
  
  // VITAMIN ENERGIE C+D
  'Crème Nourrissante Hydratante',
  'Stimu-Sérum Concentré',
  'Crème Gel Hydratante & Eclaircissante',
  'Mousse Nettoyante Tonifiante C+E',
  'Peeling Enzymatique',
  'Eau Micellaire 3en1'
]

async function verifyLireneProducts() {
  console.log('🔍 Verifying Lirene products against required list...')
  
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
  
  // Get all current Lirene products
  const currentProducts = await prisma.product.findMany({
    where: {
      brand_id: lireneBrand.id
    },
    include: {
      category: true
    }
  })
  
  console.log(`📦 Current Lirene products: ${currentProducts.length}`)
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
      (requiredProduct.includes('(Peaux Hyperpigmentées') && p.name.includes('Crème Hydratante')) ||
      (requiredProduct.includes('(Peaux Matures)') && p.name.includes('Sèrum Lissant') && !p.name.includes('Hydratante')) ||
      (requiredProduct.includes('(Peaux Matures)') && p.name.includes('Crème Comblante')) ||
      (requiredProduct.includes('(Peaux Sèches') && p.name.includes('Sèrum Lissant Hydratante')) ||
      (requiredProduct.includes('(Peaux Sèches') && p.name.includes('Crème Hydratante') && !p.name.includes('Hyperpigmentées')) ||
      (requiredProduct.includes('(Kératose)') && p.name.includes('Masque sous forme de Chaussettes')) ||
      (requiredProduct.includes('(Lissant)') && p.name.includes('Masque sous forme de Chaussettes'))
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
      (required.includes('(Peaux Hyperpigmentées') && product.name.includes('Crème Hydratante')) ||
      (required.includes('(Peaux Matures)') && product.name.includes('Sèrum Lissant') && !product.name.includes('Hydratante')) ||
      (required.includes('(Peaux Matures)') && product.name.includes('Crème Comblante')) ||
      (required.includes('(Peaux Sèches') && product.name.includes('Sèrum Lissant Hydratante')) ||
      (required.includes('(Peaux Sèches') && product.name.includes('Crème Hydratante') && !product.name.includes('Hyperpigmentées')) ||
      (required.includes('(Kératose)') && product.name.includes('Masque sous forme de Chaussettes')) ||
      (required.includes('(Lissant)') && product.name.includes('Masque sous forme de Chaussettes'))
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
  const categories = ['PROTECTION SOLAIRE', 'GELS POUR L\'HYGIÈNE INTIME', 'AQUA BUBBLES', 'ACIDE POWER', 'MEZO COLLAGÈNE', 'VEGAN (Hydratation&Nutrition)', 'SOIN INTENSE (Mains & Pieds)', 'NETTOYANTS (Visage&Yeux)', 'VITAMIN ENERGIE C+D']
  
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

verifyLireneProducts().catch(console.error)
