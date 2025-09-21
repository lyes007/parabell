import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Helper function to find the best matching image file
function findBestImageMatch(productName: string, brandSlug: string): string | null {
  const imagesDir = path.join(process.cwd(), 'public', 'images', brandSlug)
  
  if (!fs.existsSync(imagesDir)) {
    return null
  }
  
  const files = fs.readdirSync(imagesDir)
  
  // Clean the product name for matching
  const cleanProductName = productName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  
  // Try to find exact match first
  for (const file of files) {
    const cleanFileName = file
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    
    if (cleanFileName.includes(cleanProductName) || cleanProductName.includes(cleanFileName)) {
      return `/images/${brandSlug}/${file}`
    }
  }
  
  // Try partial matching with key words
  const productWords = cleanProductName.split(' ').filter(word => word.length > 3)
  
  for (const file of files) {
    const cleanFileName = file
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    
    let matchCount = 0
    for (const word of productWords) {
      if (cleanFileName.includes(word)) {
        matchCount++
      }
    }
    
    // If more than 50% of words match, use this file
    if (matchCount > productWords.length * 0.5) {
      return `/images/${brandSlug}/${file}`
    }
  }
  
  return null
}

async function fixImagePaths() {
  try {
    console.log('🔧 Fixing image paths to match actual files...')
    
    const products = await prisma.product.findMany({
      include: {
        brand: true
      }
    })
    
    let fixedCount = 0
    let notFoundCount = 0
    
    for (const product of products) {
      const brandSlug = product.brand.slug
      const currentImagePath = product.images?.[0]?.url
      
      // Skip if no current image path
      if (!currentImagePath) {
        console.log(`⚠️ No image path for: ${product.name}`)
        continue
      }
      
      // Find the best matching image file
      const correctImagePath = findBestImageMatch(product.name, brandSlug)
      
      if (correctImagePath) {
        // Update the product with the correct image path
        await prisma.product.update({
          where: { id: product.id },
          data: {
            images: [{
              url: correctImagePath,
              alt: product.name,
              type: "hero"
            }]
          }
        })
        
        console.log(`✅ Fixed: ${product.name}`)
        console.log(`   Old: ${currentImagePath}`)
        console.log(`   New: ${correctImagePath}`)
        console.log('')
        fixedCount++
      } else {
        console.log(`❌ No matching image found for: ${product.name}`)
        console.log(`   Current path: ${currentImagePath}`)
        console.log('')
        notFoundCount++
      }
    }
    
    console.log(`\n🎉 Image path fixing completed!`)
    console.log(`✅ Fixed: ${fixedCount} products`)
    console.log(`❌ Not found: ${notFoundCount} products`)
    
  } catch (error) {
    console.error('❌ Error fixing image paths:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixImagePaths()
