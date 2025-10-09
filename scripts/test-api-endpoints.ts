import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testApiEndpoints() {
  console.log('🧪 Testing API endpoints to see what products they return...')
  
  // Test the same query that the admin API uses
  console.log('\n📋 Admin API Query (same as /api/admin/products):')
  const adminProducts = await prisma.product.findMany({
    where: {
      deleted_at: null, // Only get non-deleted products
    },
    include: {
      brand: true,
    },
    orderBy: {
      created_at: "desc",
    },
  })
  
  console.log(`Found ${adminProducts.length} products in admin query`)
  
  // Filter for Forte Pharma products only
  const fortePharmaProducts = adminProducts.filter(p => 
    p.brand.name.toLowerCase().includes('forte pharma')
  )
  
  console.log(`\n📦 Forte Pharma products in admin query: ${fortePharmaProducts.length}`)
  fortePharmaProducts.forEach(product => {
    console.log(`- ${product.name} (ID: ${product.id}, Active: ${product.is_active})`)
  })
  
  // Test the same query that the public API uses
  console.log('\n📋 Public API Query (same as /api/products):')
  const publicProducts = await prisma.product.findMany({
    where: {
      is_active: true,
      deleted_at: null, // Exclude soft-deleted products
      published_at: {
        lte: new Date(),
      },
    },
    include: {
      brand: true,
      category: true,
    },
    orderBy: {
      created_at: "desc",
    },
  })
  
  console.log(`Found ${publicProducts.length} products in public query`)
  
  // Filter for Forte Pharma products only
  const fortePharmaPublicProducts = publicProducts.filter(p => 
    p.brand.name.toLowerCase().includes('forte pharma')
  )
  
  console.log(`\n📦 Forte Pharma products in public query: ${fortePharmaPublicProducts.length}`)
  fortePharmaPublicProducts.forEach(product => {
    console.log(`- ${product.name} (ID: ${product.id}, Active: ${product.is_active})`)
  })
  
  // Check for any products that might be soft-deleted but still showing
  console.log('\n🔍 Checking for soft-deleted products:')
  const softDeletedProducts = await prisma.product.findMany({
    where: {
      deleted_at: { not: null },
      brand: {
        name: {
          contains: 'Forte Pharma',
          mode: 'insensitive'
        }
      }
    },
    include: {
      brand: true,
    }
  })
  
  console.log(`Found ${softDeletedProducts.length} soft-deleted Forte Pharma products`)
  softDeletedProducts.forEach(product => {
    console.log(`- ${product.name} (ID: ${product.id}, Deleted: ${product.deleted_at})`)
  })
  
  await prisma.$disconnect()
}

testApiEndpoints().catch(console.error)
