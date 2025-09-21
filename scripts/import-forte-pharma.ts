import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// Load image mapping
const imageMappingPath = path.join(process.cwd(), 'scripts', 'image-mapping.json')
const imageMapping = fs.existsSync(imageMappingPath) 
  ? JSON.parse(fs.readFileSync(imageMappingPath, 'utf-8'))
  : {}

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

// Helper function to parse price from TND string
function parsePrice(priceStr: string): number {
  const price = parseFloat(priceStr.replace(/[^\d.,]/g, '').replace(',', '.'))
  // Convert TND to EUR (approximate rate: 1 TND = 0.3 EUR)
  return Math.round(price * 0.3 * 100) / 100
}

// Helper function to generate SKU from name
function generateSKU(name: string): string {
  const words = name.split(' ')
  const brand = 'FP'
  const product = words.slice(1, 3).map(w => w.substring(0, 3).toUpperCase()).join('')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${brand}-${product}-${random}`
}

// Helper function to map category to appropriate attributes
function getCategoryAttributes(category: string) {
  const categoryMap: Record<string, any> = {
    'Compléments Alimentaires': {
      type: 'supplement',
      form: 'capsules',
      target: 'adults'
    },
    'Minceur': {
      type: 'weight_management',
      form: 'capsules',
      target: 'adults'
    },
    'Stimulants Sexuels': {
      type: 'sexual_health',
      form: 'tablets',
      target: 'adults'
    },
    'Cheveux, peau, ongles': {
      type: 'beauty_health',
      form: 'tablets',
      target: 'adults'
    },
    'Draineurs et Detox': {
      type: 'detox',
      form: 'liquid',
      target: 'adults'
    },
    'FORME ET VITALITE': {
      type: 'energy_vitality',
      form: 'tablets',
      target: 'adults'
    },
    'Coffrets': {
      type: 'gift_set',
      form: 'mixed',
      target: 'adults'
    },
    'Bruleur de Graisse': {
      type: 'fat_burner',
      form: 'capsules',
      target: 'adults'
    },
    'soins anti-âge et anti-rides': {
      type: 'anti_aging',
      form: 'capsules',
      target: 'adults'
    },
    'Deals de la semaine': {
      type: 'special_offer',
      form: 'tablets',
      target: 'adults'
    },
    'Stress et anxiété': {
      type: 'stress_relief',
      form: 'tablets',
      target: 'adults'
    },
    'Coupe Faim et satiété': {
      type: 'appetite_control',
      form: 'capsules',
      target: 'adults'
    },
    'Articulations': {
      type: 'joint_health',
      form: 'tablets',
      target: 'adults'
    },
    'Complements alimentaires bébés et enfants': {
      type: 'children_supplement',
      form: 'chewable',
      target: 'children'
    }
  }
  
  return categoryMap[category] || {
    type: 'supplement',
    form: 'capsules',
    target: 'adults'
  }
}

// Helper function to generate description based on product name and category
function generateDescription(name: string, category: string): string {
  const baseDescriptions: Record<string, string> = {
    'Minceur': 'Formule minceur avancée pour accompagner votre perte de poids de manière naturelle et efficace.',
    'Draineurs et Detox': 'Solution drainante naturelle pour éliminer les toxines et favoriser le bien-être.',
    'FORME ET VITALITE': 'Complément alimentaire pour retrouver énergie et vitalité au quotidien.',
    'Bruleur de Graisse': 'Formule brûle-graisse puissante pour optimiser votre métabolisme et votre silhouette.',
    'soins anti-âge et anti-rides': 'Soin anti-âge intensif pour préserver la jeunesse et l\'élasticité de votre peau.',
    'Stress et anxiété': 'Solution naturelle pour gérer le stress et retrouver sérénité et bien-être mental.',
    'Coupe Faim et satiété': 'Aide naturelle pour contrôler l\'appétit et maintenir une sensation de satiété.',
    'Articulations': 'Formule spécialement conçue pour maintenir la mobilité et le confort articulaire.',
    'Cheveux, peau, ongles': 'Complément beauté pour des cheveux, une peau et des ongles en pleine santé.',
    'Stimulants Sexuels': 'Formule naturelle pour optimiser la performance et le bien-être intime.',
    'Complements alimentaires bébés et enfants': 'Complément alimentaire spécialement formulé pour les besoins nutritionnels des enfants.'
  }
  
  const baseDesc = baseDescriptions[category] || 'Complément alimentaire de qualité supérieure pour votre bien-être quotidien.'
  
  return `${baseDesc} ${name} de Forte Pharma, une marque reconnue pour la qualité et l'efficacité de ses produits.`
}

// Helper function to generate highlights based on product name
function generateHighlights(name: string, category: string): string {
  const highlights: string[] = []
  
  if (name.toLowerCase().includes('gelules') || name.toLowerCase().includes('gélules')) {
    highlights.push('• Format gélules faciles à avaler')
  }
  if (name.toLowerCase().includes('comprimes') || name.toLowerCase().includes('comprimés')) {
    highlights.push('• Format comprimés pratiques')
  }
  if (name.toLowerCase().includes('sticks')) {
    highlights.push('• Format sticks nomades')
  }
  if (name.toLowerCase().includes('ampoules')) {
    highlights.push('• Format ampoules pour une absorption optimale')
  }
  if (name.toLowerCase().includes('500ml')) {
    highlights.push('• Format 500ml économique')
  }
  if (name.toLowerCase().includes('2 x') || name.toLowerCase().includes('duo')) {
    highlights.push('• Pack duo économique')
  }
  
  // Category-specific highlights
  if (category === 'Minceur' || category === 'Bruleur de Graisse') {
    highlights.push('• Formule minceur efficace')
    highlights.push('• Résultats visibles rapidement')
  }
  if (category === 'Draineurs et Detox') {
    highlights.push('• Action drainante naturelle')
    highlights.push('• Élimination des toxines')
  }
  if (category === 'soins anti-âge et anti-rides') {
    highlights.push('• Action anti-âge intensive')
    highlights.push('• Préserve la jeunesse de la peau')
  }
  if (category === 'Stress et anxiété') {
    highlights.push('• Action apaisante naturelle')
    highlights.push('• Aide à gérer le stress')
  }
  
  highlights.push('• Marque Forte Pharma reconnue')
  highlights.push('• Qualité et efficacité garanties')
  
  return highlights.join('\n')
}

async function importFortePharmaProducts() {
  console.log('🌱 Starting Forte Pharma products import...')

  try {
    // First, create or get the Forte Pharma brand
    const fortePharmaBrand = await prisma.brand.upsert({
      where: { slug: 'forte-pharma' },
      update: {},
      create: {
        name: 'Forte Pharma',
        slug: 'forte-pharma',
        description: 'Forte Pharma est une marque française spécialisée dans les compléments alimentaires et produits de bien-être. Depuis plus de 20 ans, Forte Pharma développe des formules innovantes et efficaces pour répondre aux besoins de santé et de beauté.',
        logo_url: '/placeholder-logo.svg',
        is_active: true,
      },
    })

    console.log(`✅ Brand created/found: ${fortePharmaBrand.name}`)

    // Read and parse CSV file
    const csvPath = path.join(process.cwd(), 'FortePharmaProducts.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n').slice(1) // Skip header

    let importedCount = 0
    let skippedCount = 0

    for (const line of lines) {
      if (!line.trim()) continue

      const columns = line.split(',')
      if (columns.length < 9) continue

      try {
        const [
          webScraperOrder,
          webScraperStartUrl,
          paginationSelector,
          imageSrc,
          data,
          priceCurrency,
          data2,
          data3,
          category
        ] = columns

        // Clean up the data
        const name = data3?.replace(/"/g, '').trim()
        const priceStr = data2?.replace(/"/g, '').trim()
        const imageUrl = imageSrc?.replace(/"/g, '').trim()
        const localImageUrl = imageUrl ? imageMapping[imageUrl] || '/placeholder.jpg' : '/placeholder.jpg'
        const categoryName = category?.replace(/"/g, '').trim()

        if (!name || !priceStr) {
          console.log(`⚠️ Skipping product: missing name or price`)
          skippedCount++
          continue
        }

        const price = parsePrice(priceStr)
        const slug = createSlug(name)
        const sku = generateSKU(name)
        const attributes = getCategoryAttributes(categoryName)
        const description = generateDescription(name, categoryName)
        const highlights = generateHighlights(name, categoryName)

        // Determine product form and servings
        let servingsPerContainer = 30
        let netContent = '30 unités'
        let dosage = 'Prendre 1 à 2 unités par jour'
        let form = 'capsules'

        if (name.toLowerCase().includes('30')) {
          servingsPerContainer = 30
          netContent = '30 unités'
        } else if (name.toLowerCase().includes('60')) {
          servingsPerContainer = 60
          netContent = '60 unités'
        } else if (name.toLowerCase().includes('120')) {
          servingsPerContainer = 120
          netContent = '120 unités'
        } else if (name.toLowerCase().includes('14')) {
          servingsPerContainer = 14
          netContent = '14 unités'
        } else if (name.toLowerCase().includes('15')) {
          servingsPerContainer = 15
          netContent = '15 unités'
        } else if (name.toLowerCase().includes('28')) {
          servingsPerContainer = 28
          netContent = '28 unités'
        } else if (name.toLowerCase().includes('500ml')) {
          servingsPerContainer = 20
          netContent = '500ml'
          form = 'liquid'
          dosage = 'Prendre 25ml par jour'
        } else if (name.toLowerCase().includes('10')) {
          servingsPerContainer = 10
          netContent = '10 unités'
        }

        // Generate tags based on category and name
        const tags = [
          'forte-pharma',
          'supplement',
          ...categoryName.toLowerCase().split(' ').filter(word => word.length > 2),
          ...name.toLowerCase().split(' ').slice(0, 3).filter(word => word.length > 2)
        ].filter((tag, index, arr) => arr.indexOf(tag) === index)

        // Create product
        await prisma.product.upsert({
          where: { slug },
          update: {},
          create: {
            brand_id: fortePharmaBrand.id,
            sku,
            slug,
            name,
            short_description: description.substring(0, 150) + '...',
            description,
            highlights,
            price,
            compare_at_price: Math.round(price * 1.2 * 100) / 100, // 20% markup for compare price
            currency: 'EUR',
            track_inventory: true,
            stock_quantity: Math.floor(Math.random() * 50) + 10, // Random stock between 10-60
            inventory_policy: 'deny',
            low_stock_threshold: 5,
            weight_kg: form === 'liquid' ? 0.5 : 0.1,
            gtin: `FP${Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0')}`,
            ingredients: 'Composition détaillée disponible sur demande. Produit conforme aux normes européennes.',
            dosage,
            directions: 'Prendre avec un grand verre d\'eau. Ne pas dépasser la dose recommandée.',
            warnings: 'Ne pas utiliser chez la femme enceinte ou allaitante sans avis médical. Tenir hors de portée des enfants.',
            servings_per_container: servingsPerContainer,
            net_content: netContent,
            attributes: {
              ...attributes,
              form,
              brand: 'Forte Pharma',
              origin: 'France',
              category: categoryName
            },
            nutrition: {
              serving_size: '1 unité',
              servings_per_container: servingsPerContainer
            },
            badges: ['Made in France', 'Qualité Forte Pharma', 'Complément Alimentaire'],
            images: [{ url: localImageUrl, alt: name, type: "hero" }],
            video_urls: [],
            seo: {
              title: `${name} - Forte Pharma | Para Bell`,
              description: description.substring(0, 160),
              keywords: tags.slice(0, 5)
            },
            tags,
            is_active: true,
            is_featured: Math.random() > 0.7, // 30% chance of being featured
            published_at: new Date(),
            available_from: new Date(),
            avg_rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // Random rating between 3.0-5.0
            reviews_count: Math.floor(Math.random() * 50) + 5, // Random reviews between 5-55
            total_sold: Math.floor(Math.random() * 200) + 10, // Random sales between 10-210
          },
        })

        importedCount++
        console.log(`✅ Imported: ${name}`)

      } catch (error) {
        console.error(`❌ Error importing product:`, error)
        skippedCount++
      }
    }

    console.log(`🎉 Import completed!`)
    console.log(`✅ Successfully imported: ${importedCount} products`)
    console.log(`⚠️ Skipped: ${skippedCount} products`)

  } catch (error) {
    console.error('❌ Import failed:', error)
    throw error
  }
}

// Run the import
importFortePharmaProducts()
  .catch((e) => {
    console.error('❌ Import script failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
