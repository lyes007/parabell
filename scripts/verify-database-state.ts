import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyDatabaseState() {
  console.log('🔍 Verifying current database state for Forte Pharma products...')
  
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
  
  // Get ALL Forte Pharma products
  const allProducts = await prisma.product.findMany({
    where: {
      brand_id: fortePharmaBrand.id
    },
    include: {
      category: true
    },
    orderBy: {
      name: 'asc'
    }
  })
  
  console.log(`\n📦 Total Forte Pharma products in database: ${allProducts.length}`)
  console.log('\n📋 Complete product list:')
  
  allProducts.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name}`)
    console.log(`   - ID: ${product.id}`)
    console.log(`   - Category: ${product.category?.name || 'No category'}`)
    console.log(`   - Active: ${product.is_active}`)
    console.log(`   - Created: ${product.created_at}`)
    console.log('')
  })
  
  // Check for specific products that should have been deleted
  const problematicProducts = [
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
  
  console.log('\n🔍 Checking for problematic products that should have been deleted:')
  let foundProblematic = 0
  
  for (const productName of problematicProducts) {
    const found = allProducts.find(p => p.name === productName)
    if (found) {
      console.log(`❌ FOUND: ${productName} (ID: ${found.id})`)
      foundProblematic++
    }
  }
  
  if (foundProblematic === 0) {
    console.log('✅ No problematic products found in database')
  } else {
    console.log(`\n⚠️ Found ${foundProblematic} problematic products still in database`)
  }
  
  await prisma.$disconnect()
}

verifyDatabaseState().catch(console.error)
