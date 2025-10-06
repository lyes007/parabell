import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateProductStock() {
  try {
    console.log('Starting to update product stock...')
    
    // Get all products with 0 stock
    const productsWithZeroStock = await prisma.product.findMany({
      where: {
        stock_quantity: 0,
        deleted_at: null
      },
      select: {
        id: true,
        name: true,
        stock_quantity: true
      }
    })

    console.log(`Found ${productsWithZeroStock.length} products with 0 stock`)

    if (productsWithZeroStock.length === 0) {
      console.log('No products with 0 stock found')
      return
    }

    // Update all products to have stock (set to 50 as default)
    const updateResult = await prisma.product.updateMany({
      where: {
        stock_quantity: 0,
        deleted_at: null
      },
      data: {
        stock_quantity: 50
      }
    })

    console.log(`Successfully updated ${updateResult.count} products to have 50 units in stock`)

    // Verify the update
    const remainingZeroStock = await prisma.product.count({
      where: {
        stock_quantity: 0,
        deleted_at: null
      }
    })

    console.log(`Remaining products with 0 stock: ${remainingZeroStock}`)

    // Show some examples of updated products
    const updatedProducts = await prisma.product.findMany({
      where: {
        stock_quantity: 50,
        deleted_at: null
      },
      select: {
        id: true,
        name: true,
        stock_quantity: true
      },
      take: 5
    })

    console.log('Sample of updated products:')
    updatedProducts.forEach(product => {
      console.log(`- ${product.name}: ${product.stock_quantity} units`)
    })

  } catch (error) {
    console.error('Error updating product stock:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
updateProductStock()

