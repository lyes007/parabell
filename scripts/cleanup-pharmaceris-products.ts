import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Missing products that need to be added
const missingProducts = [
  { name: 'Mousse Nettoyante PURI-ALBUCIN I 150ml', category: 'GAMME W - Anti-Taches' },
  { name: 'Créme de Nuit ALBUCIN-INTENSIVE 30ml', category: 'GAMME W - Anti-Taches' },
  { name: 'Coup d\'éclat Immédiat Hydratation ALBUCIN -MELA 30ml', category: 'GAMME W - Anti-Taches' },
  { name: 'Coup d\'éclat ,Hydratation et Prévention des Rides ALBUCIN-C 5%de vitamine C 30ml', category: 'GAMME W - Anti-Taches' },
  { name: 'Crème repigmentante avec une zone réduite de taches de blanchiment pour le visage et le corps la nuit Viti-melo night 40 ml', category: 'GAMME V - Vitiligo' },
  { name: 'Mousse Nettoyante PURI-SEBOSTATIQUE 150ml', category: 'GAMME T - Acnéique' },
  { name: 'Mousse Nettoyante PURI-SENSILIUM 150ml', category: 'GAMME A - Peau Allergique et Sensible' }
]

async function cleanupPharmacerisProducts() {
  console.log('🧹 Cleaning up Pharmaceris products...')
  
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
  const currentProducts = await prisma.product.findMany({
    where: {
      brand_id: pharmacerisBrand.id
    },
    include: {
      category: true
    }
  })
  
  console.log(`📦 Current Pharmaceris products: ${currentProducts.length}`)
  
  let deletedCount = 0
  let addedCount = 0
  let updatedCount = 0
  
  // Update product names to match exact specifications
  const nameUpdates = [
    { current: 'Coup d\'éclat Immédiat Hydratation', new: 'Coup d\'éclat Immédiat Hydratation ALBUCIN -MELA 30ml' },
    { current: 'Coup d\'éclat ,Hydratation et Prévention des Rides', new: 'Coup d\'éclat ,Hydratation et Prévention des Rides ALBUCIN-C 5%de vitamine C 30ml' },
    { current: 'Crème de Jour SPF 50+', new: 'Crème de Jour SPF 50+ ALBUCIN-TRIPLE ACTION 30ml' },
    { current: 'Contour des Yeux', new: 'Contour des Yeux OPTI-ALBUCIN 15ml' },
    { current: 'Réduit les Hyperpigmentations (Post Inflammatoires)', new: 'Réduit les Hyperpigmentations (Post Inflammatoires) ALBUCIN-PP 3x4ml' },
    { current: 'Eau Tonifiante', new: 'Eau Tonifiante PURI-ALBUCIN II 150ml' },
    { current: 'Crème protectrice spf 50+', new: 'Crème protectrice spf 50+ pour la peau avec le problème du vitiligo-pour le visage et le corps Viti-melo day 75 ml' },
    { current: 'Gel lavant antibactérien t pour le visage', new: 'Gel lavant antibactérien t pour le visage Puri-sebogel 190 ml' },
    { current: 'Crème avec retinol pour l\'acné adulte la nuit', new: 'Crème avec retinol pour l\'acné adulte la nuit PUR-Retinol 0,3 40 ml' },
    { current: 'Spf 30 crème hydratante et apaisante pour le visage pendant et après les traitements anti acné', new: 'Spf 30 crème hydratante et apaisante pour le visage pendant et après les traitements anti acné Sebo-moistatic 50 ml' },
    { current: 'Stop Boutons Gel', new: 'Stop Boutons Gel Spot Gel 10ml' },
    { current: 'Crème Protectrice SPF 50+', new: 'Crème Protectrice SPF 50+ Medi-Acné Protect 50ml' },
    { current: 'Huile de protection sèche spf 50+', new: 'Huile de protection sèche spf 50+ Sun protect 200 ml' },
    { current: 'Baume protecteur hydrolipide spf 50+', new: 'Baume protecteur hydrolipide spf 50+ Sun body protect 150 ml' },
    { current: 'Crème protectrice spf 50+ pour l\'acné', new: 'Crème protectrice spf 50+ pour l\'acné Medi acne protect 50 ml' },
    { current: 'Crème protectrice sécurisée spf 50+ pour les enfants', new: 'Crème protectrice sécurisée spf 50+ pour les enfants Filtres 100% minéraux 50 ml' },
    { current: 'Crème solaire protectrice spf 50+ visage et corps', new: 'Crème solaire protectrice spf 50+ visage et corps Pour bébés et enfants 125 ml' },
    { current: 'Spectrum Protect  spf50+', new: 'Spectrum Protect spf50+ SUN PROTECTION CREAM 50ml' },
    { current: 'Fluide protecteur-correctif haute protection spf 50+', new: 'Fluide protecteur-correctif haute protection spf 50+ Correction solaire 02 Sable 30 ml' },
    { current: 'ALBUCIN – Crème de Jour SPF 50+', new: 'ALBUCIN – Crème de Jour SPF 50+ ALBUCIN-TRIPLE ACTION 30ml' },
    { current: 'Gel lavant corps et peau régulant le processus de peeling', new: 'Gel lavant corps et peau régulant le processus de peeling Puri-ichtilium 250 ml' },
    { current: 'Corps apaisant et fatning', new: 'Corps apaisant et fatning Ichtilium crème corps 175 ml' },
    { current: 'Shampoing Normalisant Cheveux Gras', new: 'Shampoing Normalisant Cheveux Gras H-SEBOPURIN 250ml' },
    { current: 'Shampoing Cheveux Fins et Affaiblis', new: 'Shampoing Cheveux Fins et Affaiblis H-KERATINEUM 250ml' },
    { current: 'Shampoing Anti-Pelliculaire Pellicules Grasses', new: 'Shampoing Anti-Pelliculaire Pellicules Grasses H-PURIN OILY 250ml' },
    { current: 'Shampoing Anti-Pelliculaire Pellicules Seches', new: 'Shampoing Anti-Pelliculaire Pellicules Seches H-PURIN OILY 250ml' },
    { current: 'Shampoing Cuir chevelu Sensible', new: 'Shampoing Cuir chevelu Sensible H-SENSITONIN 250ml' },
    { current: 'Shampoing Anti-Chute Anti-Cheveux Gris', new: 'Shampoing Anti-Chute Anti-Cheveux Gris H-STIMUTONE 250ml' },
    { current: 'Sparay Anti-Chute', new: 'Sparay Anti-Chute H-STIMUFORTEN 125ml' },
    { current: 'Après Shampoing Anti-Chute', new: 'Après Shampoing Anti-Chute H-STIMULINUM 250ml' },
    { current: 'Shampoing Anti-Chute', new: 'Shampoing Anti-Chute H-STIMUPURIN 250ml' },
    { current: 'Shampoing Anti-Chute Anti-Pelliculaire', new: 'Shampoing Anti-Chute Anti-Pelliculaire H-STIMUCLARIS 250ml' },
    { current: 'Shampoing Cheveux Sec', new: 'Shampoing Cheveux Sec H-NUTRIMELIN 250ml' },
    { current: 'Crème minérale dermo-protectrice EMOTOPIQUE SPF 50+', new: 'Crème minérale dermo-protectrice EMOTOPIQUE SPF 50+ CRÉME EMOTOPIC 75ml' },
    { current: 'Eau Micellaire', new: 'Eau Micellaire PREBIO-SENSITIQUE 200ml' },
    { current: 'Contour des Yeux', new: 'Contour des Yeux OPTI-SENSILIUM 15m' },
    { current: 'Crème Légère SPF20', new: 'Crème Légère SPF20 VITA-SENSILIUM 50ml' },
    { current: 'Créme Hydratante Riche en Eau', new: 'Créme Hydratante Riche en Eau HYALURO-SENSILIUM 40ml' },
    { current: 'Crème Protectrice Spécifique', new: 'Crème Protectrice Spécifique MEDI PROTECTRICE 75ml' },
    { current: 'Crème Réparatrice et Régénératrice', new: 'Crème Réparatrice et Régénératrice CORNEO-SENSILIUM 75ml' },
    { current: 'Fluide protecteur et correcteur la plus haute protection spf 50+', new: 'Fluide protecteur et correcteur la plus haute protection spf 50+ – Correction solaire 02 Ivoire 30 ml' }
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
      
      // Create the product
      const slug = missingProduct.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      
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
  
  console.log('\n📊 CLEANUP SUMMARY:')
  console.log(`📝 Updated: ${updatedCount} products`)
  console.log(`➕ Added: ${addedCount} products`)
  
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

cleanupPharmacerisProducts().catch(console.error)
