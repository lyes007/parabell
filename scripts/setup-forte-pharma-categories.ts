import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Product mappings from your list to database names
const productMappings = {
  'BEAUTÉ': [
    { listName: 'Expert Hyaluronic', dbNames: ['Expert Hyaluronic', 'Expert Hyaluronic Intense'] },
    { listName: 'Expert Collagène', dbNames: ['Expert Collagène', 'Expert Collagene Intense'] },
    { listName: 'Expert Cheveux', dbNames: ['Expert Cheveux', 'Expert Cheveux 3 en 1'] }
  ],
  'ENERGIE': [
    { listName: 'Ultra boost 4g (effervescent)', dbNames: ['Ultra boost 4g', 'Ultra boost 4G effervescent'] },
    { listName: 'Ultra boost 4G', dbNames: ['Ultra boost 4G', 'Ultra boost 4g'] },
    { listName: 'Vitalité 4g shots', dbNames: ['Vitalité 4G', 'Vitalite 4G', 'Vitalité 4g shots'] },
    { listName: 'Tigra+ Men', dbNames: ['Tigra+ Men', 'Tigra Men', 'Energie Tigra+ Men'] },
    { listName: 'Acerola Vitamine C', dbNames: ['Acerola Vitamine C', 'Acerola', 'Energie Acerola'] },
    { listName: 'Multivit\'Kids', dbNames: ['Multivit\'Kids', 'MultiVit\'Kids', 'MultiVit Kids'] }
  ],
  'SANTÉ': [
    { listName: 'Forté Flex Max Articulations', dbNames: ['Forté Flex Max Articulations', 'Forte Flex Max Articulations'] },
    { listName: 'Forté Stresse 24H', dbNames: ['Forté Stresse 24H', 'Forte Stress 24h', 'Forte Stresse 24H'] }
  ],
  'MINCEUR': [
    { listName: 'Calorilight', dbNames: ['Calorilight', 'Calori Light', 'CaloriLight'] },
    { listName: 'Xtraslim 700', dbNames: ['Xtraslim 700', 'XtraSlim 700'] },
    { listName: 'Turbodraine AGRUMES', dbNames: ['Turbodraine Agrumes', 'Turbodraine AGRUMES'] },
    { listName: 'Turbodraine ANANAS', dbNames: ['Turbodraine Ananas', 'Turbodraine ANANAS'] },
    { listName: 'Turbodraine FRAMBOISE', dbNames: ['Turbodraine Framboise', 'Turbodraine FRAMBOISE'] },
    { listName: 'Turbodraine PÊCHE', dbNames: ['Turbodraine Pêche', 'Turbodraine PÊCHE', 'Turbodraine Peche'] },
    { listName: 'XtraSlim Capteur 3 en 1', dbNames: ['XtraSlim Capteur 3 en 1', 'XTRASLIM Capteur 3 en 1'] },
    { listName: 'XtraSlim Coupe-Faim', dbNames: ['XtraSlim Coupe-Faim', 'XTRASLIM Coupe Faim'] },
    { listName: 'Rétention d\'eau', dbNames: ['Rétention d\'eau', 'Retention D\'eau'] }
  ]
}

async function setupFortePharmaCategories() {
  console.log('🌱 Setting up Forte Pharma categories and linking products...')
  
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
  
  // Get all Forte Pharma products
  const allFortePharmaProducts = await prisma.product.findMany({
    where: {
      brand_id: fortePharmaBrand.id
    }
  })
  
  console.log(`\n📦 Found ${allFortePharmaProducts.length} Forte Pharma products in database`)
  
  const foundProducts: string[] = []
  const missingProducts: string[] = []
  const extraProducts: string[] = []
  
  // Create categories and link products
  for (const [categoryName, products] of Object.entries(productMappings)) {
    console.log(`\n📂 Creating category: ${categoryName}`)
    
    // Create or find category
    const category = await prisma.category.upsert({
      where: {
        brand_id_slug: {
          brand_id: fortePharmaBrand.id,
          slug: categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-')
        }
      },
      update: {},
      create: {
        name: categoryName,
        slug: categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        description: `Catégorie ${categoryName} - Produits Forte Pharma pour ${categoryName.toLowerCase()}`,
        brand_id: fortePharmaBrand.id,
        sort_order: Object.keys(productMappings).indexOf(categoryName) + 1,
        is_active: true
      }
    })
    
    console.log(`✅ Category created/found: ${category.name}`)
    
    // Find and link products
    for (const productMapping of products) {
      let foundProduct = null
      
      // Try to find product by any of the possible names
      for (const dbName of productMapping.dbNames) {
        foundProduct = allFortePharmaProducts.find(p => 
          p.name.toLowerCase().includes(dbName.toLowerCase()) ||
          dbName.toLowerCase().includes(p.name.toLowerCase())
        )
        if (foundProduct) break
      }
      
      if (foundProduct) {
        // Update product to link to this category
        await prisma.product.update({
          where: { id: foundProduct.id },
          data: { category_id: category.id }
        })
        
        console.log(`  ✅ Linked: ${foundProduct.name} → ${categoryName}`)
        foundProducts.push(productMapping.listName)
      } else {
        console.log(`  ❌ Not found: ${productMapping.listName}`)
        missingProducts.push(productMapping.listName)
      }
    }
  }
  
  // Check for extra products not in our list
  const linkedProductIds = await prisma.product.findMany({
    where: {
      brand_id: fortePharmaBrand.id,
      category_id: { not: null }
    },
    select: { id: true, name: true }
  })
  
  for (const product of allFortePharmaProducts) {
    const isInOurList = foundProducts.some(found => 
      product.name.toLowerCase().includes(found.toLowerCase()) ||
      found.toLowerCase().includes(product.name.toLowerCase())
    )
    
    if (!isInOurList) {
      extraProducts.push(product.name)
    }
  }
  
  // Summary
  console.log('\n📊 SUMMARY:')
  console.log(`✅ Products found and linked: ${foundProducts.length}`)
  foundProducts.forEach(name => console.log(`  - ${name}`))
  
  console.log(`\n❌ Products from your list not found in database: ${missingProducts.length}`)
  missingProducts.forEach(name => console.log(`  - ${name}`))
  
  console.log(`\n➕ Extra products in database not in your list: ${extraProducts.length}`)
  extraProducts.forEach(name => console.log(`  - ${name}`))
  
  await prisma.$disconnect()
}

setupFortePharmaCategories().catch(console.error)

