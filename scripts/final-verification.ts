import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function finalVerification() {
  console.log('🔍 Final verification of Forte Pharma products...')
  
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
  
  // Get all current Forte Pharma products
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
  
  console.log(`📦 Total Forte Pharma products: ${allProducts.length}`)
  
  // Expected products by category
  const expectedProducts = {
    'BEAUTÉ': ['Expert Hyaluronic', 'Expert Collagène', 'Expert Cheveux'],
    'ENERGIE': ['Ultra boost 4g (effervescent)', 'Ultra boost 4G', 'Vitalité 4g shots', 'Tigra+ Men', 'Acerola Vitamine C', 'Multivit\'Kids'],
    'SANTÉ': ['Forté Flex Max Articulations', 'Forté Stresse 24H'],
    'MINCEUR': ['Calorilight', 'Xtraslim 700', 'Turbodraine AGRUMES', 'Turbodraine ANANAS', 'Turbodraine FRAMBOISE', 'Turbodraine PÊCHE', 'XtraSlim Capteur 3 en 1', 'XtraSlim Coupe-Faim', 'Rétention d\'eau']
  }
  
  console.log('\n📋 Current products by category:')
  
  for (const [categoryName, expectedList] of Object.entries(expectedProducts)) {
    const categoryProducts = allProducts.filter(p => p.category?.name === categoryName)
    console.log(`\n${categoryName}:`)
    
    if (categoryProducts.length === 0) {
      console.log('  (No products)')
    } else {
      categoryProducts.forEach(product => {
        console.log(`  - ${product.name}`)
      })
    }
    
    // Check for missing products
    const missingProducts = expectedList.filter(expected => 
      !categoryProducts.some(p => 
        p.name.toLowerCase().includes(expected.toLowerCase()) ||
        expected.toLowerCase().includes(p.name.toLowerCase())
      )
    )
    
    if (missingProducts.length > 0) {
      console.log(`  ❌ Missing: ${missingProducts.join(', ')}`)
    }
  }
  
  // Check for extra products
  const allExpectedNames = Object.values(expectedProducts).flat()
  const extraProducts = allProducts.filter(p => 
    !allExpectedNames.some(expected => 
      p.name.toLowerCase().includes(expected.toLowerCase()) ||
      expected.toLowerCase().includes(p.name.toLowerCase())
    )
  )
  
  if (extraProducts.length > 0) {
    console.log('\n➕ Extra products found:')
    extraProducts.forEach(product => {
      console.log(`  - ${product.name} (Category: ${product.category?.name || 'No category'})`)
    })
  }
  
  await prisma.$disconnect()
}

finalVerification().catch(console.error)
