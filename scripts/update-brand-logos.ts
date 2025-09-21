import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateBrandLogos() {
  try {
    console.log('🎨 Updating brand logos...')

    // Define the brand logos mapping
    const brandLogos = {
      'forte-pharma': '/brand-logos/forte-pharma-logo.png',
      'dermedic': '/brand-logos/dermedic-logo.png', 
      'clinic-way': '/brand-logos/clinic-way-logo.png',
      'lirene': '/brand-logos/lirene-logo.png',
      'miradent': '/brand-logos/miradent-logo.png',
      'pharmaceris': '/brand-logos/pharmaceris-logo.png'
    }

    // Update each brand with its logo
    for (const [slug, logoUrl] of Object.entries(brandLogos)) {
      const updated = await prisma.brand.updateMany({
        where: { slug },
        data: { logo_url: logoUrl }
      })
      
      console.log(`✅ Updated ${updated.count} brand(s) for ${slug}: ${logoUrl}`)
    }

    // Verify the updates
    const brands = await prisma.brand.findMany({
      select: { name: true, slug: true, logo_url: true }
    })

    console.log('\n📋 Current brand logos:')
    brands.forEach(brand => {
      console.log(`  ${brand.name} (${brand.slug}): ${brand.logo_url || 'No logo'}`)
    })

    console.log('\n🎉 Brand logos updated successfully!')

  } catch (error) {
    console.error('❌ Error updating brand logos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateBrandLogos()
