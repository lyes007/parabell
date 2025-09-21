import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Helper function to create slug from name
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Helper function to create SKU from name
function createSku(name: string): string {
  const words = name.split(' ')
  const initials = words.map(word => word.charAt(0).toUpperCase()).join('')
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `FP-${initials}-${randomNum}`
}

// Helper function to extract price from price string
function extractPrice(priceStr: string): number {
  const match = priceStr.match(/(\d+\.?\d*)/)
  return match ? parseFloat(match[1]) : 0
}

// Helper function to generate description based on product name
function generateDescription(name: string, category: string): string {
  const baseDescription = `Découvrez ${name}, un complément alimentaire de qualité supérieure de la marque Forte Pharma.`
  
  const categoryDescriptions: Record<string, string> = {
    'Compléments Alimentaires': 'Formulé avec des ingrédients soigneusement sélectionnés pour soutenir votre bien-être quotidien.',
    'Minceur': 'Spécialement conçu pour accompagner vos objectifs de perte de poids de manière naturelle et efficace.',
    'Stimulants Sexuels': 'Formule innovante pour améliorer la vitalité et les performances masculines.',
    'Cheveux, peau, ongles': 'Enrichi en nutriments essentiels pour renforcer la beauté et la santé de vos cheveux, peau et ongles.',
    'Draineurs et Detox': 'Aide à éliminer les toxines et favorise le drainage naturel de l\'organisme.',
    'FORME ET VITALITE': 'Booste votre énergie et votre vitalité pour affronter le quotidien avec dynamisme.',
    'Coffrets': 'Ensemble de produits complémentaires pour une approche globale de votre bien-être.',
    'Bruleur de Graisse': 'Formule thermogénique pour favoriser la combustion des graisses et la perte de poids.',
    'soins anti-âge et anti-rides': 'Technologie avancée pour lutter contre les signes de l\'âge et préserver la jeunesse de votre peau.',
    'Deals de la semaine': 'Offre spéciale limitée pour profiter de nos meilleurs produits à prix réduit.',
    'Stress et anxiété': 'Formule apaisante pour gérer le stress quotidien et retrouver la sérénité.',
    'Coupe Faim et satiété': 'Aide à contrôler l\'appétit et prolonge la sensation de satiété.',
    'Articulations': 'Soutient la santé articulaire et la mobilité pour une vie active.',
    'Complements alimentaires bébés et enfants': 'Formule douce et adaptée aux besoins nutritionnels des plus jeunes.',
  }
  
  const categoryDesc = categoryDescriptions[category] || 'Produit de qualité pharmaceutique pour votre bien-être.'
  
  return `${baseDescription} ${categoryDesc} Fabriqué en France selon les normes les plus strictes.`
}

// Helper function to generate highlights based on category
function generateHighlights(category: string): string[] {
  const highlightsMap: Record<string, string[]> = {
    'Compléments Alimentaires': ['Formule équilibrée', 'Qualité pharmaceutique', 'Made in France'],
    'Minceur': ['Aide à la perte de poids', 'Formule naturelle', 'Résultats visibles'],
    'Stimulants Sexuels': ['Améliore la vitalité', 'Formule masculine', 'Effet rapide'],
    'Cheveux, peau, ongles': ['Renforce les cheveux', 'Améliore la peau', 'Fortifie les ongles'],
    'Draineurs et Detox': ['Élimine les toxines', 'Drainage naturel', 'Purifie l\'organisme'],
    'FORME ET VITALITE': ['Booste l\'énergie', 'Améliore la vitalité', 'Formule dynamisante'],
    'Coffrets': ['Produits complémentaires', 'Approche globale', 'Meilleur rapport qualité-prix'],
    'Bruleur de Graisse': ['Brûle les graisses', 'Effet thermogénique', 'Perte de poids'],
    'soins anti-âge et anti-rides': ['Anti-âge', 'Lutte contre les rides', 'Préserve la jeunesse'],
    'Deals de la semaine': ['Prix réduit', 'Offre limitée', 'Meilleure qualité'],
    'Stress et anxiété': ['Apaise le stress', 'Calme l\'anxiété', 'Formule relaxante'],
    'Coupe Faim et satiété': ['Contrôle l\'appétit', 'Prolonge la satiété', 'Aide à la perte de poids'],
    'Articulations': ['Soutient les articulations', 'Améliore la mobilité', 'Soulage les douleurs'],
    'Complements alimentaires bébés et enfants': ['Formule douce', 'Adapté aux enfants', 'Sûr et efficace'],
  }
  
  return highlightsMap[category] || ['Qualité supérieure', 'Made in France', 'Efficacité prouvée']
}

// Helper function to generate ingredients based on product name
function generateIngredients(name: string, category: string): string {
  const baseIngredients = 'Extraits de plantes, vitamines et minéraux essentiels.'
  
  if (name.toLowerCase().includes('collagene')) {
    return 'Collagène marin hydrolysé, acide hyaluronique, vitamine C, extraits de plantes.'
  } else if (name.toLowerCase().includes('hyaluronique')) {
    return 'Acide hyaluronique, collagène, vitamine E, extraits de plantes anti-âge.'
  } else if (name.toLowerCase().includes('cheveux')) {
    return 'Biotine, zinc, fer, extraits de prêle, vitamines B, acides aminés.'
  } else if (name.toLowerCase().includes('stress')) {
    return 'Mélisse, passiflore, valériane, magnésium, vitamines B, extraits de plantes apaisantes.'
  } else if (name.toLowerCase().includes('articulations')) {
    return 'Glucosamine, chondroïtine, MSM, curcuma, extraits de plantes anti-inflammatoires.'
  } else if (name.toLowerCase().includes('minceur') || name.toLowerCase().includes('xtraslim')) {
    return 'Extraits de thé vert, guarana, caféine naturelle, L-carnitine, extraits de plantes brûle-graisses.'
  } else if (name.toLowerCase().includes('turbodraine')) {
    return 'Extraits de pissenlit, artichaut, thé vert, queue de cerise, extraits de plantes drainantes.'
  } else if (name.toLowerCase().includes('vitalite') || name.toLowerCase().includes('energie')) {
    return 'Ginseng, guarana, vitamines B, magnésium, extraits de plantes énergisantes.'
  }
  
  return baseIngredients
}

async function importFinalProducts() {
  console.log('🌱 Starting final products import...')
  
  try {
    // Create or find Forte Pharma brand
    let brand = await prisma.brand.findFirst({
      where: { slug: 'forte-pharma' }
    })
    
    if (!brand) {
      brand = await prisma.brand.create({
        data: {
          name: 'Forte Pharma',
          slug: 'forte-pharma',
          description: 'Forte Pharma est une marque française de compléments alimentaires de qualité pharmaceutique, spécialisée dans le bien-être et la santé.',
          logo_url: '/placeholder-logo.png'
        }
      })
    }
    
    console.log(`✅ Brand created/found: ${brand.name}`)
    
    // Read CSV file
    const csvPath = path.join(process.cwd(), 'final_products.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n').slice(1) // Skip header
    
    let importedCount = 0
    let skippedCount = 0
    
    for (const line of lines) {
      if (!line.trim()) continue
      
      const columns = line.split(',')
      if (columns.length < 4) continue
      
      const [productName, imagePath, priceStr, category] = columns
      
      // Clean up the data
      const name = productName?.replace(/"/g, '').trim()
      const imageFileName = imagePath?.replace(/"/g, '').trim().split('\\').pop() || ''
      const localImagePath = imageFileName ? `/images/forte-pharma/${imageFileName}` : '/placeholder.jpg'
      const price = extractPrice(priceStr?.replace(/"/g, '').trim() || '0')
      const categoryName = category?.replace(/"/g, '').trim()
      
      if (!name || price === 0) {
        console.log(`⚠️ Skipping product: missing name or price`)
        skippedCount++
        continue
      }
      
      // Create or find category
      let categoryRecord = await prisma.category.findFirst({
        where: { slug: createSlug(categoryName) }
      })
      
      if (!categoryRecord) {
        categoryRecord = await prisma.category.create({
          data: {
            name: categoryName,
            slug: createSlug(categoryName),
            description: `Catégorie ${categoryName} - Produits de qualité pour votre bien-être.`,
            image_url: '/placeholder.jpg'
          }
        })
      }
      
      // Generate product data
      const slug = createSlug(name)
      const sku = createSku(name)
      const description = generateDescription(name, categoryName)
      const highlights = generateHighlights(categoryName)
      const ingredients = generateIngredients(name, categoryName)
      
      // Check if product already exists
      const existingProduct = await prisma.product.findFirst({
        where: { slug }
      })
      
      if (existingProduct) {
        console.log(`⏭️ Product already exists: ${name}`)
        continue
      }
      
      // Create product
      await prisma.product.create({
        data: {
          name,
          slug,
          sku,
          description,
          short_description: description.substring(0, 150) + '...',
          price,
          compare_at_price: price * 1.2, // 20% higher compare price
          cost_price: price * 0.6, // 60% of selling price
          currency: "TND",
          stock_quantity: Math.floor(Math.random() * 100) + 10,
          low_stock_threshold: 10,
          weight_kg: Math.random() * 0.5 + 0.1, // Random weight between 0.1-0.6 kg
          length_cm: 15,
          width_cm: 8,
          height_cm: 3,
          is_featured: Math.random() > 0.7, // 30% chance of being featured
          is_active: true,
          track_inventory: true,
          inventory_policy: 'deny',
          highlights: highlights.join(', '),
          ingredients,
          dosage: '1 à 2 unités par jour, de préférence le matin avec un grand verre d\'eau.',
          directions: 'Prendre selon les indications, de préférence avant les repas. Ne pas dépasser la dose recommandée.',
          warnings: 'Ne pas utiliser en cas de grossesse ou d\'allaitement. Tenir hors de portée des enfants. Consulter un médecin en cas de traitement médical.',
          servings_per_container: Math.floor(Math.random() * 60) + 30,
          net_content: `${Math.floor(Math.random() * 100) + 30}g`,
          attributes: {
            brand: 'Forte Pharma',
            origin: 'France',
            certification: 'ISO 22000',
            allergens: 'Aucun allergène majeur',
            category: categoryName
          },
          nutrition: {
            serving_size: '1 unité',
            servings_per_container: Math.floor(Math.random() * 60) + 30
          },
          badges: ['Made in France', 'Qualité Forte Pharma', 'Complément Alimentaire'],
          images: [{ url: localImagePath, alt: name, type: "hero" }],
          video_urls: [],
          seo: {
            title: `${name} - Forte Pharma | Para Bell`,
            description: description.substring(0, 160),
            keywords: [name.toLowerCase(), 'forte pharma', categoryName.toLowerCase()]
          },
          tags: [categoryName.toLowerCase(), 'forte pharma', 'compléments alimentaires'],
          avg_rating: Math.random() * 2 + 3, // Random rating between 3-5
          reviews_count: Math.floor(Math.random() * 50) + 5,
          total_sold: BigInt(Math.floor(Math.random() * 100) + 10),
          brand_id: brand.id
        }
      })
      
      console.log(`✅ Imported: ${name}`)
      importedCount++
    }
    
    console.log(`🎉 Import completed!`)
    console.log(`✅ Successfully imported: ${importedCount} products`)
    console.log(`⚠️ Skipped: ${skippedCount} products`)
    
  } catch (error) {
    console.error('❌ Import failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the import
importFinalProducts()
  .catch((error) => {
    console.error('❌ Import script failed:', error)
    process.exit(1)
  })
