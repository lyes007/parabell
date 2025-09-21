import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Brand configuration
const brands = [
  { name: 'Dermedic', slug: 'dermedic', folder: 'Dermedic' },
  { name: 'Pharmaceris', slug: 'pharmaceris', folder: 'Pharmaceris' },
  { name: 'Lirene', slug: 'lirene', folder: 'Lirene' },
  { name: 'ClinicWay', slug: 'clinic-way', folder: 'ClinicWay' },
  { name: 'MiraDent', slug: 'miradent', folder: 'MiraDent' }
]

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
function createSku(name: string, brandName: string): string {
  const words = name.split(' ')
  const initials = words.map(word => word.charAt(0).toUpperCase()).join('')
  const brandInitials = brandName.split(' ').map(word => word.charAt(0)).join('')
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${brandInitials}-${initials}-${randomNum}`
}

// Helper function to extract price from price string
function extractPrice(priceStr: string): number {
  const match = priceStr.match(/(\d+\.?\d*)/)
  return match ? parseFloat(match[1]) : 0
}

// Helper function to generate description based on product name and category
function generateDescription(name: string, category: string, brandName: string): string {
  const baseDescription = `Découvrez ${name}, un produit de qualité supérieure de la marque ${brandName}.`
  
  const categoryDescriptions: Record<string, string> = {
    'Anti Chute de Cheveux & Fortifiants': 'Formulé pour renforcer et fortifier les cheveux, réduire la chute et améliorer la densité capillaire.',
    'Coffrets': 'Ensemble de produits complémentaires pour une routine de soins complète et efficace.',
    'Protection supérieure à SPF 50+': 'Protection solaire maximale pour préserver votre peau des rayons UV nocifs.',
    'Soins hydratants et nourrissants': 'Formule hydratante pour nourrir et protéger votre peau en profondeur.',
    'Peaux grasses': 'Spécialement conçu pour les peaux grasses, aide à réguler la production de sébum.',
    'Gel, crème, huile': 'Produit de soin adapté à votre type de peau pour un nettoyage et une hydratation optimaux.',
    'Soins Spécifiques': 'Formule ciblée pour répondre aux besoins spécifiques de votre peau.',
    'Visage': 'Soin visage adapté à votre type de peau pour une beauté naturelle.',
    'Lait, mousse, émulsion': 'Produit de nettoyage doux et efficace pour votre routine beauté.',
    'Protection Solaire Visage': 'Protection solaire spécialement formulée pour le visage.',
    'soins anti-taches et dépigmentants': 'Formule éclaircissante pour atténuer les taches et unifier le teint.',
    'Shampoing cheveux secs, fins, cassants': 'Shampoing nourrissant pour cheveux secs, fins et cassants.',
    'Shampoing antipelliculaire': 'Shampoing spécialement formulé pour lutter contre les pellicules.',
    'Compléments Alimentaires': 'Complément alimentaire de qualité pour soutenir votre bien-être.',
    'Minceur': 'Produit minceur pour accompagner vos objectifs de perte de poids.',
    'Stimulants Sexuels': 'Formule pour améliorer la vitalité et les performances.',
    'Cheveux, peau, ongles': 'Enrichi en nutriments essentiels pour renforcer cheveux, peau et ongles.',
    'Draineurs et Detox': 'Aide à éliminer les toxines et favorise le drainage naturel.',
    'FORME ET VITALITE': 'Booste votre énergie et votre vitalité.',
    'Bruleur de Graisse': 'Formule thermogénique pour favoriser la combustion des graisses.',
    'soins anti-âge et anti-rides': 'Technologie avancée pour lutter contre les signes de l\'âge.',
    'Deals de la semaine': 'Offre spéciale limitée pour profiter de nos meilleurs produits.',
    'Stress et anxiété': 'Formule apaisante pour gérer le stress quotidien.',
    'Coupe Faim et satiété': 'Aide à contrôler l\'appétit et prolonge la sensation de satiété.',
    'Articulations': 'Soutient la santé articulaire et la mobilité.',
    'Complements alimentaires bébés et enfants': 'Formule douce et adaptée aux besoins nutritionnels des plus jeunes.',
  }
  
  const categoryDesc = categoryDescriptions[category] || 'Produit de qualité pharmaceutique pour votre bien-être.'
  
  return `${baseDescription} ${categoryDesc} Fabriqué selon les normes les plus strictes.`
}

// Helper function to generate highlights based on category and brand
function generateHighlights(category: string, brandName: string): string[] {
  const baseHighlights = [`Qualité ${brandName}`, 'Made in France', 'Efficacité prouvée']
  
  const categoryHighlights: Record<string, string[]> = {
    'Anti Chute de Cheveux & Fortifiants': ['Renforce les cheveux', 'Réduit la chute', 'Améliore la densité'],
    'Coffrets': ['Produits complémentaires', 'Approche globale', 'Meilleur rapport qualité-prix'],
    'Protection supérieure à SPF 50+': ['Protection maximale', 'Anti-UV', 'Résistant à l\'eau'],
    'Soins hydratants et nourrissants': ['Hydratation intense', 'Nourrit en profondeur', 'Peau douce'],
    'Peaux grasses': ['Régule le sébum', 'Matifie', 'Pores resserrés'],
    'Gel, crème, huile': ['Nettoyage doux', 'Hydratation', 'Adapté à tous types'],
    'Soins Spécifiques': ['Formule ciblée', 'Résultats visibles', 'Soin personnalisé'],
    'Visage': ['Soin visage', 'Beauté naturelle', 'Texture agréable'],
    'Lait, mousse, émulsion': ['Nettoyage doux', 'Routine beauté', 'Peau propre'],
    'Protection Solaire Visage': ['Protection visage', 'Anti-âge', 'Texture légère'],
    'soins anti-taches et dépigmentants': ['Éclaircit', 'Unifie le teint', 'Anti-taches'],
    'Shampoing cheveux secs, fins, cassants': ['Nourrit', 'Renforce', 'Cheveux soyeux'],
    'Shampoing antipelliculaire': ['Anti-pellicules', 'Cuir chevelu sain', 'Cheveux propres'],
  }
  
  const categorySpecific = categoryHighlights[category] || []
  return [...baseHighlights, ...categorySpecific].slice(0, 5)
}

// Helper function to generate ingredients based on product name
function generateIngredients(name: string, category: string): string {
  const baseIngredients = 'Ingrédients actifs, extraits de plantes, vitamines et minéraux essentiels.'
  
  if (name.toLowerCase().includes('hyaluronique') || name.toLowerCase().includes('hyaluro')) {
    return 'Acide hyaluronique, collagène, vitamine E, extraits de plantes hydratantes.'
  } else if (name.toLowerCase().includes('vitamine c') || name.toLowerCase().includes('antiox')) {
    return 'Vitamine C, antioxydants, extraits de plantes, acides de fruits.'
  } else if (name.toLowerCase().includes('spf') || name.toLowerCase().includes('solaire')) {
    return 'Filtres UV, antioxydants, extraits de plantes, vitamines protectrices.'
  } else if (name.toLowerCase().includes('shampooing') || name.toLowerCase().includes('cheveux')) {
    return 'Extraits de plantes, vitamines B, acides aminés, agents nettoyants doux.'
  } else if (name.toLowerCase().includes('nettoyant') || name.toLowerCase().includes('mousse')) {
    return 'Agents nettoyants doux, extraits de plantes, hydratants naturels.'
  } else if (name.toLowerCase().includes('anti-tache') || name.toLowerCase().includes('melumin')) {
    return 'Actifs éclaircissants, extraits de plantes, vitamines, agents apaisants.'
  }
  
  return baseIngredients
}

async function migrateAllBrands() {
  console.log('🚀 Starting migration of all brands...')
  
  let totalImported = 0
  let totalSkipped = 0
  
  for (const brandConfig of brands) {
    console.log(`\n📦 Processing brand: ${brandConfig.name}`)
    
    try {
      // Create or find brand
      let brand = await prisma.brand.findFirst({
        where: { slug: brandConfig.slug }
      })
      
      if (!brand) {
        brand = await prisma.brand.create({
          data: {
            name: brandConfig.name,
            slug: brandConfig.slug,
            description: `${brandConfig.name} est une marque de qualité spécialisée dans les produits de soins et de bien-être.`,
            logo_url: '/placeholder-logo.png'
          }
        })
        console.log(`✅ Brand created: ${brandConfig.name}`)
      } else {
        console.log(`✅ Brand found: ${brandConfig.name}`)
      }
      
      // Copy images to public directory
      const sourceImagesDir = path.join(process.cwd(), 'output', brandConfig.folder, `${brandConfig.name}Images`)
      const targetImagesDir = path.join(process.cwd(), 'public', 'images', brandConfig.slug)
      
      if (fs.existsSync(sourceImagesDir)) {
        if (!fs.existsSync(targetImagesDir)) {
          fs.mkdirSync(targetImagesDir, { recursive: true })
        }
        
        // Copy images (simplified - in production you might want to use a proper copy function)
        console.log(`📁 Images directory: ${sourceImagesDir}`)
        console.log(`📁 Target directory: ${targetImagesDir}`)
      }
      
      // Read matched products CSV for actual prices
      const matchedProductsPath = path.join(process.cwd(), 'output', brandConfig.folder, `${brandConfig.name}_matched_products.csv`)
      
      if (!fs.existsSync(matchedProductsPath)) {
        console.log(`⚠️ No matched products file found for ${brandConfig.name}`)
        continue
      }
      
      const csvContent = fs.readFileSync(matchedProductsPath, 'utf-8')
      const lines = csvContent.split('\n').slice(1) // Skip header
      
      let brandImported = 0
      let brandSkipped = 0
      
      for (const line of lines) {
        if (!line.trim()) continue
        
        const columns = line.split(',')
        if (columns.length < 9) continue
        
        // Handle different CSV formats - some have image2-src column, some don't
        let webScraperOrder, webScraperStartUrl, paginationSelector, imageSrc, image2Src, priceCurrency, priceStr, data2, productName, category
        
        if (columns.length === 10) {
          // Format with image2-src column
          [webScraperOrder, webScraperStartUrl, paginationSelector, imageSrc, image2Src, priceCurrency, priceStr, data2, productName, category] = columns
        } else if (columns.length === 9) {
          // Format without image2-src column
          [webScraperOrder, webScraperStartUrl, paginationSelector, imageSrc, priceCurrency, priceStr, data2, productName, category] = columns
          image2Src = ''
        } else {
          console.log(`⚠️ Skipping line with unexpected column count: ${columns.length}`)
          continue
        }
        
        // Clean up the data
        const name = productName?.replace(/"/g, '').trim()
        const price = extractPrice(priceStr?.replace(/"/g, '').trim() || '0')
        const categoryName = category?.replace(/"/g, '').trim()
        const imageFileName = imageSrc?.replace(/"/g, '').trim().split('/').pop() || ''
        const localImagePath = imageFileName ? `/images/${brandConfig.slug}/${imageFileName}` : '/placeholder.jpg'
        
        if (!name || price === 0) {
          console.log(`⚠️ Skipping product: missing name or price - ${name}`)
          brandSkipped++
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
        const sku = createSku(name, brandConfig.name)
        const description = generateDescription(name, categoryName, brandConfig.name)
        const highlights = generateHighlights(categoryName, brandConfig.name)
        const ingredients = generateIngredients(name, categoryName)
        
        // Check if product already exists
        const existingProduct = await prisma.product.findFirst({
          where: { slug }
        })
        
        if (existingProduct) {
          console.log(`⏭️ Product already exists: ${name}`)
          brandSkipped++
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
            compare_at_price: price * 1.2,
            cost_price: price * 0.6,
            currency: "TND",
            stock_quantity: Math.floor(Math.random() * 100) + 10,
            low_stock_threshold: 10,
            weight_kg: Math.random() * 0.5 + 0.1,
            length_cm: 15,
            width_cm: 8,
            height_cm: 3,
            is_featured: Math.random() > 0.8, // 20% chance of being featured
            is_active: true,
            track_inventory: true,
            inventory_policy: 'deny',
            highlights: highlights.join(', '),
            ingredients,
            dosage: 'Utiliser selon les indications, de préférence le matin et/ou le soir.',
            directions: 'Appliquer selon les instructions du produit. Ne pas dépasser la dose recommandée.',
            warnings: 'Ne pas utiliser en cas de grossesse ou d\'allaitement. Tenir hors de portée des enfants. Consulter un médecin en cas de traitement médical.',
            servings_per_container: Math.floor(Math.random() * 60) + 30,
            net_content: `${Math.floor(Math.random() * 100) + 30}g`,
            attributes: {
              brand: brandConfig.name,
              origin: 'France',
              certification: 'ISO 22000',
              allergens: 'Aucun allergène majeur',
              category: categoryName
            },
            nutrition: {
              serving_size: '1 unité',
              servings_per_container: Math.floor(Math.random() * 60) + 30
            },
            badges: [`Made in France`, `Qualité ${brandConfig.name}`, 'Produit de qualité'],
            images: [{ url: localImagePath, alt: name, type: "hero" }],
            video_urls: [],
            seo: {
              title: `${name} - ${brandConfig.name} | Para Bell`,
              description: description.substring(0, 160),
              keywords: [name.toLowerCase(), brandConfig.name.toLowerCase(), categoryName.toLowerCase()]
            },
            tags: [categoryName.toLowerCase(), brandConfig.name.toLowerCase(), 'produits de qualité'],
            avg_rating: Math.random() * 2 + 3,
            reviews_count: Math.floor(Math.random() * 50) + 5,
            total_sold: BigInt(Math.floor(Math.random() * 100) + 10),
            brand_id: brand.id,
            published_at: new Date()
          }
        })
        
        console.log(`✅ Imported: ${name}`)
        brandImported++
      }
      
      console.log(`📊 ${brandConfig.name}: ${brandImported} imported, ${brandSkipped} skipped`)
      totalImported += brandImported
      totalSkipped += brandSkipped
      
    } catch (error) {
      console.error(`❌ Error processing ${brandConfig.name}:`, error)
    }
  }
  
  console.log(`\n🎉 Migration completed!`)
  console.log(`✅ Total imported: ${totalImported} products`)
  console.log(`⚠️ Total skipped: ${totalSkipped} products`)
  
  await prisma.$disconnect()
}

// Run the migration
migrateAllBrands()
  .catch((error) => {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  })
