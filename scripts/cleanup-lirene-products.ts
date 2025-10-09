import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Products that should exist (from your list) with exact matching
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

async function cleanupLireneProducts() {
  console.log('🧹 Cleaning up Lirene products...')
  
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
  
  let keptCount = 0
  let deletedCount = 0
  let updatedCount = 0
  
  // Process each current product
  for (const product of currentProducts) {
    // Check if this product should be kept
    const shouldKeep = requiredProducts.some(required => {
      // Exact match or close match
      return product.name.toLowerCase().includes(required.toLowerCase()) ||
             required.toLowerCase().includes(product.name.toLowerCase()) ||
             // Handle special cases with slight name differences
             (required.includes('(Peaux Hyperpigmentées') && product.name.includes('Crème Hydratante') && !product.name.includes('(Peaux Sèches')) ||
             (required.includes('(Peaux Matures)') && product.name.includes('Sèrum Lissant') && !product.name.includes('Hydratante')) ||
             (required.includes('(Peaux Matures)') && product.name.includes('Crème Comblante')) ||
             (required.includes('(Peaux Sèches') && product.name.includes('Sèrum Lissant Hydratante')) ||
             (required.includes('(Peaux Sèches') && product.name.includes('Crème Hydratante') && !product.name.includes('Hyperpigmentées')) ||
             (required.includes('(Kératose)') && product.name.includes('Masque sous forme de Chaussettes')) ||
             (required.includes('(Lissant)') && product.name.includes('Masque sous forme de Chaussettes'))
    })
    
    if (shouldKeep) {
      // Check if we need to update the product name to match exactly
      const exactMatch = requiredProducts.find(required => 
        product.name.toLowerCase().includes(required.toLowerCase()) ||
        required.toLowerCase().includes(product.name.toLowerCase())
      )
      
      if (exactMatch && product.name !== exactMatch) {
        try {
          await prisma.product.update({
            where: { id: product.id },
            data: { name: exactMatch }
          })
          console.log(`📝 Updated: "${product.name}" → "${exactMatch}"`)
          updatedCount++
        } catch (error) {
          console.log(`❌ Error updating ${product.name}:`, error.message)
        }
      }
      
      console.log(`✅ Keeping: ${product.name}`)
      keptCount++
    } else {
      try {
        console.log(`🗑️ Deleting: ${product.name}`)
        
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
  
  console.log('\n📊 CLEANUP SUMMARY:')
  console.log(`✅ Kept: ${keptCount} products`)
  console.log(`📝 Updated: ${updatedCount} products`)
  console.log(`🗑️ Deleted: ${deletedCount} products`)
  
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

cleanupLireneProducts().catch(console.error)
