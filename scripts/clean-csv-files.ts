import fs from 'fs'
import path from 'path'

// Products that should be kept (from your original list)
const keepProducts = [
  'Expert Hyaluronic',
  'Expert Collagène', 
  'Expert Cheveux',
  'Ultra boost 4g',
  'Ultra boost 4G',
  'Vitalité 4g shots',
  'Tigra+ Men',
  'Acerola Vitamine C',
  'Multivit\'Kids',
  'Forté Flex Max Articulations',
  'Forté Stresse 24H',
  'Calorilight',
  'Xtraslim 700',
  'Turbodraine AGRUMES',
  'Turbodraine ANANAS',
  'Turbodraine FRAMBOISE',
  'Turbodraine PÊCHE',
  'XtraSlim Capteur 3 en 1',
  'XtraSlim Coupe-Faim',
  'Rétention d\'eau'
]

// Products that should be deleted
const deleteProducts = [
  'FORTE PHARMA Calori Light 30 Gelules',
  'FORTE PHARMA Calori Light 60 Gelules',
  'FORTE PHARMA Turbodraine Minceur Peche 500ml',
  'FORTE PHARMA Turbodraine Minceur Framboise 500ml',
  'FORTE PHARMA Energie Acerola 60 Comprimes',
  'FORTE PHARMA Duo Pack Turbodraine Pèche 2 x 500ml',
  'FORTE PHARMA Expert Collagene Intense 14 Sticks',
  'Forté Pharma XtraSlim Capteur 3en1 + TurboDraine Offert',
  'FORTE PHARMA XTRASLIM Coupe Faim 60 Gelules',
  'FORTE PHARMA Retention D\'eau 28 Comprimes',
  'Forté Pharma MultiVit\'Kids Défenses 30 Comprimés à Croquer',
  'FORTE PHARMA Vitalite 4G Dynamisant 10 Ampoules',
  'Multivit\'Kids',
  'FortéNuit 8h',
  'Rétention d\'eau'
]

function shouldKeepProduct(productName: string): boolean {
  // Check if it's in the delete list
  if (deleteProducts.some(deleteName => 
    productName.toLowerCase().includes(deleteName.toLowerCase()) ||
    deleteName.toLowerCase().includes(productName.toLowerCase())
  )) {
    return false
  }
  
  // Check if it's in the keep list
  return keepProducts.some(keepName => 
    productName.toLowerCase().includes(keepName.toLowerCase()) ||
    keepName.toLowerCase().includes(productName.toLowerCase())
  )
}

function cleanCsvFile(filePath: string) {
  console.log(`🧹 Cleaning CSV file: ${filePath}`)
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`)
    return
  }
  
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  
  if (lines.length === 0) {
    console.log(`⚠️ Empty file: ${filePath}`)
    return
  }
  
  const header = lines[0]
  const dataLines = lines.slice(1)
  
  let keptCount = 0
  let deletedCount = 0
  
  const cleanedLines = [header]
  
  for (const line of dataLines) {
    if (!line.trim()) {
      cleanedLines.push(line)
      continue
    }
    
    // Extract product name from CSV line
    let productName = ''
    if (filePath.includes('final_products.csv')) {
      // Format: product_name,image_path,price,category
      const columns = line.split(',')
      productName = columns[0]?.replace(/"/g, '').trim() || ''
    } else if (filePath.includes('FortePharmaProducts.csv')) {
      // Format: web-scraper-order,web-scraper-start-url,pagination-selector,image-src,data,priceCurrency,data2,data3,category
      const columns = line.split(',')
      productName = columns[7]?.replace(/"/g, '').trim() || ''
    } else if (filePath.includes('Forté Pharma.csv')) {
      // This is a more complex format, skip for now
      console.log(`⚠️ Skipping complex CSV format: ${filePath}`)
      return
    }
    
    if (shouldKeepProduct(productName)) {
      cleanedLines.push(line)
      keptCount++
    } else {
      deletedCount++
      console.log(`  🗑️ Removing: ${productName}`)
    }
  }
  
  // Write cleaned content back to file
  const cleanedContent = cleanedLines.join('\n')
  fs.writeFileSync(filePath, cleanedContent, 'utf-8')
  
  console.log(`✅ Cleaned ${filePath}`)
  console.log(`  - Kept: ${keptCount} products`)
  console.log(`  - Removed: ${deletedCount} products`)
}

async function cleanCsvFiles() {
  console.log('🧹 Cleaning CSV files to remove extra products...')
  
  const csvFiles = [
    'final_products.csv',
    'FortePharmaProducts.csv',
    'PARABELLESTOCK/Forté Pharma.csv'
  ]
  
  for (const csvFile of csvFiles) {
    const filePath = path.join(process.cwd(), csvFile)
    cleanCsvFile(filePath)
  }
  
  console.log('\n✅ CSV files cleaned successfully!')
}

cleanCsvFiles().catch(console.error)
