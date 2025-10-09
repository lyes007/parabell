import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Products that should exist (from your list)
const requiredProducts = [
  // GAMME W – Anti-Taches
  'Mousse Nettoyante PURI-ALBUCIN I 150ml',
  'Créme de Nuit ALBUCIN-INTENSIVE 30ml',
  'Crème de Jour SPF 50+ ALBUCIN-TRIPLE ACTION 30ml',
  'Contour des Yeux OPTI-ALBUCIN 15ml',
  'Coup d\'éclat Immédiat Hydratation ALBUCIN -MELA 30ml',
  'Réduit les Hyperpigmentations (Post Inflammatoires) ALBUCIN-PP 3x4ml',
  'Coup d\'éclat ,Hydratation et Prévention des Rides ALBUCIN-C 5%de vitamine C 30ml',
  'Eau Tonifiante PURI-ALBUCIN II 150ml',
  
  // GAMME V – Vitiligo
  'Crème protectrice spf 50+ pour la peau avec le problème du vitiligo-pour le visage et le corps Viti-melo day 75 ml',
  'Crème repigmentante avec une zone réduite de taches de blanchiment pour le visage et le corps la nuit Viti-melo night 40 ml',
  
  // GAMME T – Acnéique
  'Gel lavant antibactérien t pour le visage Puri-sebogel 190 ml',
  'Crème avec retinol pour l\'acné adulte la nuit PUR-Retinol 0,3 40 ml',
  'Spf 30 crème hydratante et apaisante pour le visage pendant et après les traitements anti acné Sebo-moistatic 50 ml',
  'Mousse Nettoyante PURI-SEBOSTATIQUE 150ml',
  'Stop Boutons Gel Spot Gel 10ml',
  'Crème Protectrice SPF 50+ Medi-Acné Protect 50ml',
  
  // GAMME S – Protection solaire
  'Huile de protection sèche spf 50+ Sun protect 200 ml',
  'Baume protecteur hydrolipide spf 50+ Sun body protect 150 ml',
  'Crème protectrice spf 50+ pour l\'acné Medi acne protect 50 ml',
  'Crème protectrice sécurisée spf 50+ pour les enfants Filtres 100% minéraux 50 ml',
  'Crème solaire protectrice spf 50+ visage et corps Pour bébés et enfants 125 ml',
  'Spectrum Protect spf50+ SUN PROTECTION CREAM 50ml',
  'Fluide protecteur-correctif haute protection spf 50+ Correction solaire 02 Sable 30 ml',
  'Fluide protecteur-correctif haute protection spf 50+ Correction solaire 01 Sable 30 ml',
  'ALBUCIN – Crème de Jour SPF 50+ ALBUCIN-TRIPLE ACTION 30ml',
  
  // GAMME P – Psoriasis
  'Gel lavant corps et peau régulant le processus de peeling Puri-ichtilium 250 ml',
  'Corps apaisant et fatning Ichtilium crème corps 175 ml',
  
  // GAMME H – Cheveux et Cuir chevelu
  'Shampoing Normalisant Cheveux Gras H-SEBOPURIN 250ml',
  'Shampoing Cheveux Fins et Affaiblis H-KERATINEUM 250ml',
  'Shampoing Anti-Pelliculaire Pellicules Grasses H-PURIN OILY 250ml',
  'Shampoing Anti-Pelliculaire Pellicules Seches H-PURIN OILY 250ml',
  'Shampoing Cuir chevelu Sensible H-SENSITONIN 250ml',
  'Shampoing Anti-Chute Anti-Cheveux Gris H-STIMUTONE 250ml',
  'Sparay Anti-Chute H-STIMUFORTEN 125ml',
  'Après Shampoing Anti-Chute H-STIMULINUM 250ml',
  'Shampoing Anti-Chute H-STIMUPURIN 250ml',
  'Shampoing Anti-Chute Anti-Pelliculaire H-STIMUCLARIS 250ml',
  'Shampoing Cheveux Sec H-NUTRIMELIN 250ml',
  
  // GAMME E – Peau Sèche et Atopique
  'Crème minérale dermo-protectrice EMOTOPIQUE SPF 50+ CRÉME EMOTOPIC 75ml',
  
  // GAMME A – Peau Allergique et Sensible
  'Eau Micellaire PREBIO-SENSITIQUE 200ml',
  'Mousse Nettoyante PURI-SENSILIUM 150ml',
  'Contour des Yeux OPTI-SENSILIUM 15m',
  'Crème Légère SPF20 VITA-SENSILIUM 50ml',
  'Créme Hydratante Riche en Eau HYALURO-SENSILIUM 40ml',
  'Crème Protectrice Spécifique MEDI PROTECTRICE 75ml',
  'Crème Réparatrice et Régénératrice CORNEO-SENSILIUM 75ml',
  
  // GAMME F – Fluid Fondation
  'Fluide protecteur et correcteur la plus haute protection spf 50+ – Correction solaire 02 Ivoire 30 ml',
  'Fluide protecteur-correctif haute protection spf 50+ – Correction solaire 01 Sable 30 ml'
]

async function verifyPharmacerisProducts() {
  console.log('🔍 Verifying Pharmaceris products against required list...')
  
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
      (requiredProduct.includes('ALBUCIN-TRIPLE ACTION') && p.name.includes('ALBUCIN – Crème de Jour SPF 50+')) ||
      (requiredProduct.includes('OPTI-ALBUCIN') && p.name.includes('Contour des Yeux')) ||
      (requiredProduct.includes('ALBUCIN -MELA') && p.name.includes('Coup d\'éclat Immédiat Hydratation')) ||
      (requiredProduct.includes('ALBUCIN-PP') && p.name.includes('Réduit les Hyperpigmentations')) ||
      (requiredProduct.includes('ALBUCIN-C') && p.name.includes('Coup d\'éclat ,Hydratation et Prévention des Rides')) ||
      (requiredProduct.includes('PURI-ALBUCIN II') && p.name.includes('Eau Tonifiante')) ||
      (requiredProduct.includes('Viti-melo day') && p.name.includes('Crème protectrice spf 50+')) ||
      (requiredProduct.includes('Viti-melo night') && p.name.includes('Crème repigmentante')) ||
      (requiredProduct.includes('Puri-sebogel') && p.name.includes('Gel lavant antibactérien')) ||
      (requiredProduct.includes('PUR-Retinol') && p.name.includes('Crème avec retinol')) ||
      (requiredProduct.includes('Sebo-moistatic') && p.name.includes('Spf 30 crème hydratante')) ||
      (requiredProduct.includes('PURI-SEBOSTATIQUE') && p.name.includes('Mousse Nettoyante')) ||
      (requiredProduct.includes('Stop Boutons Gel') && p.name.includes('Stop Boutons Gel')) ||
      (requiredProduct.includes('Medi-Acné Protect') && p.name.includes('Crème Protectrice SPF 50+')) ||
      (requiredProduct.includes('Sun protect') && p.name.includes('Huile de protection sèche')) ||
      (requiredProduct.includes('Sun body protect') && p.name.includes('Baume protecteur hydrolipide')) ||
      (requiredProduct.includes('Medi acne protect') && p.name.includes('Crème protectrice spf 50+ pour l\'acné')) ||
      (requiredProduct.includes('Filtres 100% minéraux') && p.name.includes('Crème protectrice sécurisée')) ||
      (requiredProduct.includes('Pour bébés et enfants') && p.name.includes('Crème solaire protectrice')) ||
      (requiredProduct.includes('SUN PROTECTION CREAM') && p.name.includes('Spectrum Protect')) ||
      (requiredProduct.includes('Correction solaire 02 Sable') && p.name.includes('Fluide protecteur-correctif haute protection')) ||
      (requiredProduct.includes('Correction solaire 01 Sable') && p.name.includes('Fluide protecteur-correctif haute protection')) ||
      (requiredProduct.includes('Puri-ichtilium') && p.name.includes('Gel lavant corps et peau')) ||
      (requiredProduct.includes('Ichtilium crème corps') && p.name.includes('Corps apaisant et fatning')) ||
      (requiredProduct.includes('H-SEBOPURIN') && p.name.includes('Shampoing Normalisant Cheveux Gras')) ||
      (requiredProduct.includes('H-KERATINEUM') && p.name.includes('Shampoing Cheveux Fins et Affaiblis')) ||
      (requiredProduct.includes('H-PURIN OILY') && p.name.includes('Shampoing Anti-Pelliculaire Pellicules Grasses')) ||
      (requiredProduct.includes('H-PURIN OILY') && p.name.includes('Shampoing Anti-Pelliculaire Pellicules Seches')) ||
      (requiredProduct.includes('H-SENSITONIN') && p.name.includes('Shampoing Cuir chevelu Sensible')) ||
      (requiredProduct.includes('H-STIMUTONE') && p.name.includes('Shampoing Anti-Chute Anti-Cheveux Gris')) ||
      (requiredProduct.includes('H-STIMUFORTEN') && p.name.includes('Sparay Anti-Chute')) ||
      (requiredProduct.includes('H-STIMULINUM') && p.name.includes('Après Shampoing Anti-Chute')) ||
      (requiredProduct.includes('H-STIMUPURIN') && p.name.includes('Shampoing Anti-Chute')) ||
      (requiredProduct.includes('H-STIMUCLARIS') && p.name.includes('Shampoing Anti-Chute Anti-Pelliculaire')) ||
      (requiredProduct.includes('H-NUTRIMELIN') && p.name.includes('Shampoing Cheveux Sec')) ||
      (requiredProduct.includes('EMOTOPIC') && p.name.includes('Crème minérale dermo-protectrice')) ||
      (requiredProduct.includes('PREBIO-SENSITIQUE') && p.name.includes('Eau Micellaire')) ||
      (requiredProduct.includes('PURI-SENSILIUM') && p.name.includes('Mousse Nettoyante')) ||
      (requiredProduct.includes('OPTI-SENSILIUM') && p.name.includes('Contour des Yeux')) ||
      (requiredProduct.includes('VITA-SENSILIUM') && p.name.includes('Crème Légère SPF20')) ||
      (requiredProduct.includes('HYALURO-SENSILIUM') && p.name.includes('Créme Hydratante Riche en Eau')) ||
      (requiredProduct.includes('MEDI PROTECTRICE') && p.name.includes('Crème Protectrice Spécifique')) ||
      (requiredProduct.includes('CORNEO-SENSILIUM') && p.name.includes('Crème Réparatrice et Régénératrice')) ||
      (requiredProduct.includes('Correction solaire 02 Ivoire') && p.name.includes('Fluide protecteur et correcteur la plus haute protection')) ||
      (requiredProduct.includes('Correction solaire 01 Sable') && p.name.includes('Fluide protecteur-correctif haute protection'))
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
      (required.includes('ALBUCIN-TRIPLE ACTION') && product.name.includes('ALBUCIN – Crème de Jour SPF 50+')) ||
      (required.includes('OPTI-ALBUCIN') && product.name.includes('Contour des Yeux')) ||
      (required.includes('ALBUCIN -MELA') && product.name.includes('Coup d\'éclat Immédiat Hydratation')) ||
      (required.includes('ALBUCIN-PP') && product.name.includes('Réduit les Hyperpigmentations')) ||
      (required.includes('ALBUCIN-C') && product.name.includes('Coup d\'éclat ,Hydratation et Prévention des Rides')) ||
      (required.includes('PURI-ALBUCIN II') && product.name.includes('Eau Tonifiante')) ||
      (required.includes('Viti-melo day') && product.name.includes('Crème protectrice spf 50+')) ||
      (required.includes('Viti-melo night') && product.name.includes('Crème repigmentante')) ||
      (required.includes('Puri-sebogel') && product.name.includes('Gel lavant antibactérien')) ||
      (required.includes('PUR-Retinol') && product.name.includes('Crème avec retinol')) ||
      (required.includes('Sebo-moistatic') && product.name.includes('Spf 30 crème hydratante')) ||
      (required.includes('PURI-SEBOSTATIQUE') && product.name.includes('Mousse Nettoyante')) ||
      (required.includes('Stop Boutons Gel') && product.name.includes('Stop Boutons Gel')) ||
      (required.includes('Medi-Acné Protect') && product.name.includes('Crème Protectrice SPF 50+')) ||
      (required.includes('Sun protect') && product.name.includes('Huile de protection sèche')) ||
      (required.includes('Sun body protect') && product.name.includes('Baume protecteur hydrolipide')) ||
      (required.includes('Medi acne protect') && product.name.includes('Crème protectrice spf 50+ pour l\'acné')) ||
      (required.includes('Filtres 100% minéraux') && product.name.includes('Crème protectrice sécurisée')) ||
      (required.includes('Pour bébés et enfants') && product.name.includes('Crème solaire protectrice')) ||
      (required.includes('SUN PROTECTION CREAM') && product.name.includes('Spectrum Protect')) ||
      (required.includes('Correction solaire 02 Sable') && product.name.includes('Fluide protecteur-correctif haute protection')) ||
      (required.includes('Correction solaire 01 Sable') && product.name.includes('Fluide protecteur-correctif haute protection')) ||
      (required.includes('Puri-ichtilium') && product.name.includes('Gel lavant corps et peau')) ||
      (required.includes('Ichtilium crème corps') && product.name.includes('Corps apaisant et fatning')) ||
      (required.includes('H-SEBOPURIN') && product.name.includes('Shampoing Normalisant Cheveux Gras')) ||
      (required.includes('H-KERATINEUM') && product.name.includes('Shampoing Cheveux Fins et Affaiblis')) ||
      (required.includes('H-PURIN OILY') && product.name.includes('Shampoing Anti-Pelliculaire Pellicules Grasses')) ||
      (required.includes('H-PURIN OILY') && product.name.includes('Shampoing Anti-Pelliculaire Pellicules Seches')) ||
      (required.includes('H-SENSITONIN') && product.name.includes('Shampoing Cuir chevelu Sensible')) ||
      (required.includes('H-STIMUTONE') && product.name.includes('Shampoing Anti-Chute Anti-Cheveux Gris')) ||
      (required.includes('H-STIMUFORTEN') && product.name.includes('Sparay Anti-Chute')) ||
      (required.includes('H-STIMULINUM') && product.name.includes('Après Shampoing Anti-Chute')) ||
      (required.includes('H-STIMUPURIN') && product.name.includes('Shampoing Anti-Chute')) ||
      (required.includes('H-STIMUCLARIS') && product.name.includes('Shampoing Anti-Chute Anti-Pelliculaire')) ||
      (required.includes('H-NUTRIMELIN') && product.name.includes('Shampoing Cheveux Sec')) ||
      (required.includes('EMOTOPIC') && product.name.includes('Crème minérale dermo-protectrice')) ||
      (required.includes('PREBIO-SENSITIQUE') && product.name.includes('Eau Micellaire')) ||
      (required.includes('PURI-SENSILIUM') && product.name.includes('Mousse Nettoyante')) ||
      (required.includes('OPTI-SENSILIUM') && product.name.includes('Contour des Yeux')) ||
      (required.includes('VITA-SENSILIUM') && product.name.includes('Crème Légère SPF20')) ||
      (required.includes('HYALURO-SENSILIUM') && product.name.includes('Créme Hydratante Riche en Eau')) ||
      (required.includes('MEDI PROTECTRICE') && product.name.includes('Crème Protectrice Spécifique')) ||
      (required.includes('CORNEO-SENSILIUM') && product.name.includes('Crème Réparatrice et Régénératrice')) ||
      (required.includes('Correction solaire 02 Ivoire') && product.name.includes('Fluide protecteur et correcteur la plus haute protection')) ||
      (required.includes('Correction solaire 01 Sable') && product.name.includes('Fluide protecteur-correctif haute protection'))
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
  const categories = ['GAMME W - Anti-Taches', 'GAMME V - Vitiligo', 'GAMME T - Acnéique', 'GAMME S - Protection solaire', 'GAMME P - Psoriasis', 'GAMME H - Cheveux et Cuir chevelu', 'GAMME E - Peau Sèche et Atopique', 'GAMME A - Peau Allergique et Sensible', 'GAMME F - Fluid Fondation']
  
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

verifyPharmacerisProducts().catch(console.error)
