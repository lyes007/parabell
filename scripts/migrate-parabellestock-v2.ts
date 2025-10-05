import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import https from 'https'
import { URL } from 'url'

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

// Helper function to create SKU from name and brand
function createSku(name: string, brand: string): string {
  const brandPrefix = brand.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 3)
  const words = name.split(' ')
  const initials = words.map(word => word.charAt(0).toUpperCase()).join('').substring(0, 4)
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${brandPrefix}-${initials}-${randomNum}`
}

// Helper function to download image
async function downloadImage(imageUrl: string, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = new URL(imageUrl)
    const filepath = path.join(process.cwd(), 'public', 'products', filename)
    
    // Ensure directory exists
    const dir = path.dirname(filepath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    const file = fs.createWriteStream(filepath)
    
    https.get(imageUrl, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file)
        file.on('finish', () => {
          file.close()
          resolve(`/products/${filename}`)
        })
      } else {
        reject(new Error(`Failed to download image: ${response.statusCode}`))
      }
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}) // Delete the file on error
      reject(err)
    })
  })
}

// Helper function to extract filename from URL
function getImageFilename(imageUrl: string, productName: string): string {
  try {
    const url = new URL(imageUrl)
    const pathname = url.pathname
    const extension = path.extname(pathname) || '.jpg'
    const slug = createSlug(productName)
    return `${slug}${extension}`
  } catch {
    const slug = createSlug(productName)
    return `${slug}.jpg`
  }
}

// Brand mapping
const brandMapping: Record<string, { name: string; slug: string; description: string }> = {
  'Lirene': {
    name: 'Lirene',
    slug: 'lirene',
    description: 'Lirene est une marque de cosmétiques polonaise reconnue pour ses produits de soins de la peau de qualité professionnelle.'
  },
  'Forté Pharma': {
    name: 'Forté Pharma',
    slug: 'forte-pharma',
    description: 'Forté Pharma est une marque française de compléments alimentaires de qualité pharmaceutique, spécialisée dans le bien-être et la santé.'
  },
  'Pharmaceris': {
    name: 'Pharmaceris',
    slug: 'pharmaceris',
    description: 'Pharmaceris est une marque polonaise de cosmétiques dermatologiques, spécialisée dans les soins de la peau sensibles et problématiques.'
  },
  'Dermedic': {
    name: 'Dermedic',
    slug: 'dermedic',
    description: 'Dermedic est une marque de cosmétiques dermatologiques polonaise, spécialisée dans les soins de la peau et les traitements dermatologiques.'
  },
  'Clinic Way': {
    name: 'Clinic Way',
    slug: 'clinic-way',
    description: 'Clinic Way est une marque de cosmétiques anti-âge de qualité professionnelle, spécialisée dans les soins anti-rides et anti-âge.'
  },
  'Miradent': {
    name: 'Miradent',
    slug: 'miradent',
    description: 'Miradent est une marque allemande spécialisée dans les produits d\'hygiène bucco-dentaire et les soins dentaires professionnels.'
  },
  'Physio sources': {
    name: 'Physio sources',
    slug: 'physio-sources',
    description: 'Physio sources est une marque de compléments alimentaires naturels, spécialisée dans les solutions de bien-être et de santé naturelle.'
  }
}

// File to brand mapping (using exact database names)
const fileBrandMapping: Record<string, string> = {
  'Lirene.csv': 'Lirene',
  'Lirene  VITAMIN ENERGIE C+D.csv': 'Lirene',
  'Forté Pharma.csv': 'Forte Pharma',
  'Forté Pharma  MINCEUR.csv': 'Forte Pharma',
  'Pharmaceris.csv': 'Pharmaceris',
  'Pharmaceris  GAMME F - Fluid Fondation.csv': 'Pharmaceris',
  'Dermedic.csv': 'Dermedic',
  'Dermedic  HYDRAIN.csv': 'Dermedic',
  'Clinic Way.csv': 'ClinicWay',
  'Miradent.csv': 'MiraDent',
  'Physio sources.csv': 'Physio sources'
}

// Category mapping for specialized product lines
const categoryMapping: Record<string, string> = {
  'VITAMIN ENERGIE C+D': 'Protection Solaire',
  'MINCEUR': 'Minceur et Perte de Poids',
  'GAMME F - Fluid Fondation': 'Maquillage et Fond de Teint',
  'HYDRAIN': 'Soins Hydratants',
  'GAMME A - Peau Allergique et Sensible': 'Peau Sensible',
  'GAMME W - Anti-Taches': 'Anti-Taches et Éclaircissement',
  '1° Rides d\'expression (Dynamiques)': 'Anti-Rides Dynamiques',
  '2° Rides Statiques (Vieillesse)': 'Anti-Rides Statiques',
  'Brosses à dents à ALPHA-LON': 'Hygiène Bucco-Dentaire',
  'Compléments Alimentaires': 'Compléments Alimentaires'
}

async function clearExistingData() {
  console.log('🧹 Clearing existing data...')
  
  // Clear in correct order due to foreign key constraints
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.review.deleteMany()
  await prisma.product.deleteMany()
  
  console.log('✅ Existing data cleared')
}

async function ensureBrands() {
  console.log('🏢 Ensuring brands exist...')
  
  for (const [key, brandData] of Object.entries(brandMapping)) {
    await prisma.brand.upsert({
      where: { slug: brandData.slug },
      update: {},
      create: {
        name: brandData.name,
        slug: brandData.slug,
        description: brandData.description,
        logo_url: `/brands/${brandData.slug}-logo.png`,
        is_active: true
      }
    })
    console.log(`✅ Brand: ${brandData.name}`)
  }
}

// Improved CSV parser that handles multi-line fields
function parseCsvWithMultiline(content: string): string[][] {
  const lines: string[][] = []
  let currentLine: string[] = []
  let currentField = ''
  let inQuotes = false
  let i = 0
  
  while (i < content.length) {
    const char = content[i]
    const nextChar = content[i + 1]
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"'
        i += 2
        continue
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      currentLine.push(currentField.trim())
      currentField = ''
    } else if (char === '\n' && !inQuotes) {
      // Line separator
      currentLine.push(currentField.trim())
      if (currentLine.length > 0) {
        lines.push(currentLine)
      }
      currentLine = []
      currentField = ''
    } else {
      currentField += char
    }
    
    i++
  }
  
  // Add the last field and line
  if (currentField.trim() || currentLine.length > 0) {
    currentLine.push(currentField.trim())
    if (currentLine.length > 0) {
      lines.push(currentLine)
    }
  }
  
  return lines
}

async function processCsvFile(filePath: string, brandName: string) {
  console.log(`📄 Processing ${filePath}...`)
  
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = parseCsvWithMultiline(content)
  
  if (lines.length < 2) {
    console.warn(`⚠️ No data found in ${filePath}`)
    return { importedCount: 0, skippedCount: 0 }
  }
  
  const header = lines[0]
  const dataLines = lines.slice(1)
  
  console.log(`📋 Header: ${header.join(' | ')}`)
  
  const brand = await prisma.brand.findFirst({
    where: { name: brandName }
  })
  
  if (!brand) {
    console.error(`❌ Brand not found: ${brandName}`)
    return { importedCount: 0, skippedCount: 0 }
  }
  
  let importedCount = 0
  let skippedCount = 0
  
  for (const line of dataLines) {
    if (line.length < 6) continue
    
    try {
      // Find product name and image URL based on header structure
      let productName = ''
      let imageUrl = ''
      let category = ''
      let description = ''
      
      // Look for Article-headline-0 (product name)
      const headlineIndex = header.findIndex(h => h.includes('Article-headline'))
      if (headlineIndex >= 0 && headlineIndex < line.length) {
        productName = line[headlineIndex]?.trim() || ''
      }
      
      // Look for image-0-src (image URL)
      const imageIndex = header.findIndex(h => h.includes('image-0-src'))
      if (imageIndex >= 0 && imageIndex < line.length) {
        imageUrl = line[imageIndex]?.trim() || ''
      }
      
      // Look for category
      const categoryIndex = header.findIndex(h => h.includes('Category') || h.includes('Product Category'))
      if (categoryIndex >= 0 && categoryIndex < line.length) {
        category = line[categoryIndex]?.trim() || ''
      }
      
      // Look for description
      const descIndex = header.findIndex(h => h.includes('Description'))
      if (descIndex >= 0 && descIndex < line.length) {
        description = line[descIndex]?.trim() || ''
      }
      
      // Skip if no valid product name
      if (!productName || productName.length < 3) {
        skippedCount++
        continue
      }
      
      // Skip if it looks like an ingredient or component name
      if (productName.length > 100 || 
          productName.includes('mg') || 
          productName.includes('%') ||
          productName.includes('(') && productName.includes(')') && productName.length < 20) {
        skippedCount++
        continue
      }
      
      const slug = createSlug(productName)
      const sku = createSku(productName, brandName)
      
      // Check if product already exists
      const existingProduct = await prisma.product.findFirst({
        where: { slug }
      })
      
      if (existingProduct) {
        skippedCount++
        continue
      }
      
      // Download image
      let localImagePath = '/placeholder-product.jpg'
      if (imageUrl && imageUrl.includes('http') && (imageUrl.includes('.jpg') || imageUrl.includes('.png') || imageUrl.includes('.webp'))) {
        try {
          const filename = getImageFilename(imageUrl, productName)
          localImagePath = await downloadImage(imageUrl, filename)
          console.log(`📸 Downloaded: ${filename}`)
        } catch (error) {
          console.warn(`⚠️ Failed to download image for ${productName}: ${error}`)
        }
      } else {
        console.log(`📸 No valid image URL for ${productName}, using placeholder`)
      }
      
      // Determine category
      const productCategory = categoryMapping[category] || category || 'Autres'
      
      // Create product
      await prisma.product.create({
        data: {
          brand_id: brand.id,
          sku,
          slug,
          name: productName,
          short_description: description.substring(0, 150) + (description.length > 150 ? '...' : ''),
          description,
          highlights: `Produit de qualité ${brandName}`,
          price: 0, // Set to 0 TND as requested
          currency: 'TND',
          stock_quantity: 0,
          track_inventory: true,
          inventory_policy: 'deny',
          low_stock_threshold: 5,
          is_active: true,
          is_featured: false,
          ingredients: 'Composition détaillée disponible sur demande.',
          dosage: 'Utiliser selon les indications du fabricant.',
          directions: 'Consulter la notice d\'utilisation.',
          warnings: 'Tenir hors de portée des enfants.',
          attributes: {
            brand: brandName,
            category: productCategory,
            origin: 'Importé',
            quality: 'Professionnel'
          },
          badges: [`${brandName}`, 'Qualité Professionnelle'],
          images: [{ url: localImagePath, alt: productName, type: 'hero' }],
          video_urls: [],
          seo: {
            title: `${productName} - ${brandName} | Para Bell`,
            description: description.substring(0, 160),
            keywords: [productName, brandName, productCategory]
          },
          tags: [brandName, productCategory]
        }
      })
      
      importedCount++
      console.log(`✅ Imported: ${productName}`)
      
    } catch (error) {
      console.error(`❌ Error processing line: ${error}`)
      skippedCount++
    }
  }
  
  console.log(`📊 ${filePath}: ${importedCount} imported, ${skippedCount} skipped`)
  return { importedCount, skippedCount }
}

async function migrateParabellestock() {
  console.log('🚀 Starting PARABELLESTOCK migration v2...')
  
  try {
    // Step 1: Clear existing data
    await clearExistingData()
    
    // Step 2: Ensure all brands exist
    await ensureBrands()
    
    // Step 3: Process all CSV files
    const csvFiles = [
      'PARABELLESTOCK/Lirene.csv',
      'PARABELLESTOCK/Lirene  VITAMIN ENERGIE C+D.csv',
      'PARABELLESTOCK/Forté Pharma.csv',
      'PARABELLESTOCK/Forté Pharma  MINCEUR.csv',
      'PARABELLESTOCK/Pharmaceris.csv',
      'PARABELLESTOCK/Pharmaceris  GAMME F - Fluid Fondation.csv',
      'PARABELLESTOCK/Dermedic.csv',
      'PARABELLESTOCK/Dermedic  HYDRAIN.csv',
      'PARABELLESTOCK/Clinic Way.csv',
      'PARABELLESTOCK/Miradent.csv',
      'PARABELLESTOCK/Physio sources.csv'
    ]
    
    let totalImported = 0
    let totalSkipped = 0
    
    for (const file of csvFiles) {
      const filePath = path.join(process.cwd(), file)
      const fileName = path.basename(file)
      const brandName = fileBrandMapping[fileName]
      
      if (fs.existsSync(filePath)) {
        if (brandName) {
          const result = await processCsvFile(filePath, brandName)
          if (result) {
            totalImported += result.importedCount
            totalSkipped += result.skippedCount
          }
        } else {
          console.warn(`⚠️ No brand mapping found for file: ${fileName}`)
        }
      } else {
        console.warn(`⚠️ File not found: ${filePath}`)
      }
    }
    
    // Step 4: Summary
    console.log('\n🎉 Migration completed!')
    console.log(`📊 Total imported: ${totalImported} products`)
    console.log(`📊 Total skipped: ${totalSkipped} products`)
    
    // Final count
    const finalCount = await prisma.product.count()
    console.log(`📊 Final product count: ${finalCount}`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
if (require.main === module) {
  migrateParabellestock()
    .then(() => {
      console.log('✅ Migration script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error)
      process.exit(1)
    })
}

export { migrateParabellestock }
