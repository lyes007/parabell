import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// List of extra products to delete (exact names from database)
const productsToDelete = [
  'Multivit\'Kids',
  'FortéNuit 8h',
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
  'Rétention d\'eau'
]

async function deleteExtraFortePharmaProducts() {
  console.log('🗑️ Deleting extra Forte Pharma products...')
  
  // Find Forte Pharma brand
  const fortePharmaBrand = await prisma.brand.findFirst({
    where: {
      name: {
        contains: 'Forte Pharma',
        mode: 'insensitive'
      }
    }
  })
  
  if (!fortePharmaBrand) {
    console.log('❌ Forte Pharma brand not found in database')
    return
  }
  
  console.log(`✅ Found Forte Pharma brand: ${fortePharmaBrand.name} (ID: ${fortePharmaBrand.id})`)
  
  let deletedCount = 0
  let notFoundCount = 0
  
  for (const productName of productsToDelete) {
    try {
      // Find the product by name
      const product = await prisma.product.findFirst({
        where: {
          name: productName,
          brand_id: fortePharmaBrand.id
        }
      })
      
      if (product) {
        // Delete the product (this will also handle related records due to cascade)
        await prisma.product.delete({
          where: { id: product.id }
        })
        
        console.log(`✅ Deleted: ${productName}`)
        deletedCount++
      } else {
        console.log(`❌ Not found: ${productName}`)
        notFoundCount++
      }
    } catch (error) {
      console.log(`❌ Error deleting ${productName}:`, error)
    }
  }
  
  // Also handle the duplicate "FortéNuit 8h" entries
  const forteNuitProducts = await prisma.product.findMany({
    where: {
      name: 'FortéNuit 8h',
      brand_id: fortePharmaBrand.id
    }
  })
  
  for (const product of forteNuitProducts) {
    try {
      await prisma.product.delete({
        where: { id: product.id }
      })
      console.log(`✅ Deleted duplicate: FortéNuit 8h (ID: ${product.id})`)
      deletedCount++
    } catch (error) {
      console.log(`❌ Error deleting FortéNuit 8h (ID: ${product.id}):`, error)
    }
  }
  
  console.log('\n📊 DELETION SUMMARY:')
  console.log(`✅ Successfully deleted: ${deletedCount} products`)
  console.log(`❌ Not found: ${notFoundCount} products`)
  
  // Verify remaining Forte Pharma products
  const remainingProducts = await prisma.product.findMany({
    where: {
      brand_id: fortePharmaBrand.id
    },
    include: {
      category: true
    }
  })
  
  console.log(`\n📦 Remaining Forte Pharma products: ${remainingProducts.length}`)
  remainingProducts.forEach(product => {
    console.log(`- ${product.name} (Category: ${product.category?.name || 'No category'})`)
  })
  
  await prisma.$disconnect()
}

deleteExtraFortePharmaProducts().catch(console.error)
