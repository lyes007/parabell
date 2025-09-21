import fs from 'fs'
import path from 'path'
import https from 'https'
import { createWriteStream } from 'fs'

// Helper function to download an image
async function downloadImage(url: string, filename: string): Promise<boolean> {
  return new Promise((resolve) => {
    const file = createWriteStream(filename)
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file)
        file.on('finish', () => {
          file.close()
          console.log(`✅ Downloaded: ${filename}`)
          resolve(true)
        })
      } else {
        console.log(`❌ Failed to download: ${url} (Status: ${response.statusCode})`)
        file.close()
        fs.unlink(filename, () => {}) // Delete empty file
        resolve(false)
      }
    }).on('error', (err) => {
      console.log(`❌ Error downloading ${url}:`, err.message)
      file.close()
      fs.unlink(filename, () => {}) // Delete empty file
      resolve(false)
    })
  })
}

// Helper function to create a safe filename
function createSafeFilename(url: string, index: number): string {
  const urlParts = url.split('/')
  const originalFilename = urlParts[urlParts.length - 1]
  const extension = path.extname(originalFilename) || '.jpg'
  const baseName = `forte-pharma-${index + 1}`
  return `${baseName}${extension}`
}

async function downloadFortePharmaImages() {
  console.log('🖼️ Starting Forte Pharma images download...')
  
  // Create images directory if it doesn't exist
  const imagesDir = path.join(process.cwd(), 'public', 'images', 'forte-pharma')
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true })
  }
  
  // Read CSV file
  const csvPath = path.join(process.cwd(), 'FortePharmaProducts.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.split('\n').slice(1) // Skip header
  
  let downloadedCount = 0
  let failedCount = 0
  const imageMap: Record<string, string> = {}
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue
    
    const columns = line.split(',')
    if (columns.length < 9) continue
    
    const imageSrc = columns[3]?.replace(/"/g, '').trim()
    
    if (imageSrc && imageSrc.startsWith('http')) {
      const filename = createSafeFilename(imageSrc, i)
      const localPath = `/images/forte-pharma/${filename}`
      const fullPath = path.join(imagesDir, filename)
      
      // Skip if already downloaded
      if (fs.existsSync(fullPath)) {
        console.log(`⏭️ Already exists: ${filename}`)
        imageMap[imageSrc] = localPath
        continue
      }
      
      const success = await downloadImage(imageSrc, fullPath)
      if (success) {
        imageMap[imageSrc] = localPath
        downloadedCount++
      } else {
        // Use placeholder for failed downloads
        imageMap[imageSrc] = '/placeholder.jpg'
        failedCount++
      }
      
      // Add small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
  
  // Save the image mapping for the import script
  const mappingPath = path.join(process.cwd(), 'scripts', 'image-mapping.json')
  fs.writeFileSync(mappingPath, JSON.stringify(imageMap, null, 2))
  
  console.log(`🎉 Download completed!`)
  console.log(`✅ Successfully downloaded: ${downloadedCount} images`)
  console.log(`❌ Failed downloads: ${failedCount} images`)
  console.log(`📁 Images saved to: ${imagesDir}`)
  console.log(`🗂️ Image mapping saved to: ${mappingPath}`)
}

// Run the download
downloadFortePharmaImages()
  .catch((error) => {
    console.error('❌ Download script failed:', error)
    process.exit(1)
  })
