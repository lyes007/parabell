import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Parse CSV file
function parseCSV(csvContent: string) {
  const lines = csvContent.split('\n')
  const headers = lines[0].split(',')
  const products = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    const values = line.split(',')
    if (values.length >= headers.length) {
      const product: any = {}
      headers.forEach((header, index) => {
        product[header.replace(/"/g, '')] = values[index]?.replace(/"/g, '').trim()
      })
      products.push(product)
    }
  }
  
  return products
}

async function addMissingPharmacerisFromCSV() {
  console.log('📄 Adding missing Pharmaceris products from CSV files...')
  
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
  
  // Read CSV files
  const gammeFCsvPath = path.join(process.cwd(), 'PARABELLESTOCK', 'Pharmaceris  GAMME F - Fluid Fondation.csv')
  const pharmacerisCsvPath = path.join(process.cwd(), 'PARABELLESTOCK', 'Pharmaceris.csv')
  
  let gammeFProducts = []
  let pharmacerisProducts = []
  
  try {
    const gammeFCsvContent = fs.readFileSync(gammeFCsvPath, 'utf-8')
    gammeFProducts = parseCSV(gammeFCsvContent)
    console.log(`📄 Found ${gammeFProducts.length} products in GAMME F CSV`)
  } catch (error) {
    console.log('❌ Error reading GAMME F CSV:', error.message)
  }
  
  try {
    const pharmacerisCsvContent = fs.readFileSync(pharmacerisCsvPath, 'utf-8')
    pharmacerisProducts = parseCSV(pharmacerisCsvContent)
    console.log(`📄 Found ${pharmacerisProducts.length} products in main Pharmaceris CSV`)
  } catch (error) {
    console.log('❌ Error reading main Pharmaceris CSV:', error.message)
  }
  
  // Get current products in database
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
  
  // Process GAMME F products
  console.log('\n🔍 Processing GAMME F products...')
  for (const product of gammeFProducts) {
    if (!product['Article-headline-0']) continue
    
    const productName = product['Article-headline-0'].trim()
    const productDetails = product['Product Details-0'] || ''
    const imageSrc = product['image-0-src'] || ''
    
    // Check if product already exists
    const exists = currentProductNames.some(name => 
      name.includes(productName.toLowerCase()) || 
      productName.toLowerCase().includes(name)
    )
    
    if (exists) {
      console.log(`✅ Already exists: ${productName}`)
      continue
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
          image_url: '',
          is_active: true,
          sort_order: 9,
          brand_id: pharmacerisBrand.id
        }
      })
      console.log(`➕ Created category: GAMME F - Fluid Fondation`)
    }
    
    // Create product
    const slug = productName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    
    const sku = `PC-F-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
    
    try {
      const newProduct = await prisma.product.create({
        data: {
          name: productName,
          slug: slug,
          sku: sku,
          brand_id: pharmacerisBrand.id,
          category_id: category.id,
          price: 40.00,
          currency: 'EUR',
          short_description: `Produit ${productName} de la marque Pharmaceris`,
          description: productDetails || `Découvrez ${productName}, un produit de qualité supérieure de la marque Pharmaceris.`,
          is_active: true,
          stock_quantity: 100,
          track_inventory: true,
          images: imageSrc ? [imageSrc] : [],
          attributes: {},
          badges: ['Made in France', 'Qualité Pharmaceris'],
          tags: ['gamme-f', 'fluid-fondation'],
          seo: {
            title: `${productName} - Pharmaceris | Para Bell`,
            description: `Achetez ${productName} de Pharmaceris sur Para Bell. Qualité garantie et livraison rapide.`
          }
        }
      })
      
      console.log(`➕ Added: ${productName} (ID: ${newProduct.id})`)
      addedCount++
    } catch (error) {
      console.log(`❌ Error adding ${productName}:`, error.message)
    }
  }
  
  // Process other Pharmaceris products
  console.log('\n🔍 Processing other Pharmaceris products...')
  for (const product of pharmacerisProducts) {
    if (!product['Article-headline-0']) continue
    
    const productName = product['Article-headline-0'].trim()
    const categoryName = product['Product Category-0'] || ''
    const productDetails = product['Product Description-0'] || ''
    const imageSrc = product['image-0-src'] || ''
    
    // Check if product already exists
    const exists = currentProductNames.some(name => 
      name.includes(productName.toLowerCase()) || 
      productName.toLowerCase().includes(name)
    )
    
    if (exists) {
      console.log(`✅ Already exists: ${productName}`)
      continue
    }
    
    // Find category
    let category = null
    if (categoryName) {
      category = await prisma.category.findFirst({
        where: {
          name: categoryName,
          brand_id: pharmacerisBrand.id
        }
      })
    }
    
    if (!category) {
      console.log(`❌ Category not found for: ${productName} (${categoryName})`)
      continue
    }
    
    // Create product
    const slug = productName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    
    const sku = `PC-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
    
    try {
      const newProduct = await prisma.product.create({
        data: {
          name: productName,
          slug: slug,
          sku: sku,
          brand_id: pharmacerisBrand.id,
          category_id: category.id,
          price: 35.00,
          currency: 'EUR',
          short_description: `Produit ${productName} de la marque Pharmaceris`,
          description: productDetails || `Découvrez ${productName}, un produit de qualité supérieure de la marque Pharmaceris.`,
          is_active: true,
          stock_quantity: 100,
          track_inventory: true,
          images: imageSrc ? [imageSrc] : [],
          attributes: {},
          badges: ['Made in France', 'Qualité Pharmaceris'],
          tags: [categoryName.toLowerCase()],
          seo: {
            title: `${productName} - Pharmaceris | Para Bell`,
            description: `Achetez ${productName} de Pharmaceris sur Para Bell. Qualité garantie et livraison rapide.`
          }
        }
      })
      
      console.log(`➕ Added: ${productName} (ID: ${newProduct.id})`)
      addedCount++
    } catch (error) {
      console.log(`❌ Error adding ${productName}:`, error.message)
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

addMissingPharmacerisFromCSV().catch(console.error)
