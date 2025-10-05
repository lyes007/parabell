import { prisma } from '../lib/prisma'

async function testOrderCreation() {
  try {
    console.log('🧪 Testing order creation...')
    
    // Get a sample product
    const product = await prisma.product.findFirst({
      where: {
        is_active: true,
        published_at: {
          lte: new Date(),
        },
      },
      include: {
        brand: true,
      },
    })

    if (!product) {
      console.log('❌ No products found in database')
      return
    }

    console.log(`✅ Found product: ${product.name}`)
    console.log(`   Price: ${product.price} ${product.currency}`)
    console.log(`   Brand: ${product.brand.name}`)

    // Test order data
    const orderData = {
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
      address: "123 Test Street",
      city: "Tunis",
      postalCode: "1000",
      country: "Tunisia",
      phone: "+216 12 345 678",
      paymentMethod: "card",
      notes: "Test order",
      items: [
        {
          product: {
            id: product.id.toString(),
            name: product.name,
            price: product.price,
          },
          quantity: 2,
        }
      ],
      total: product.price * 2,
      currency: "TND"
    }

    console.log('\n📝 Creating test order...')
    
    // Create the order
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          email: orderData.email,
          status: "pending",
          total_amount: orderData.total,
          currency: orderData.currency,
          shipping_address: {
            firstName: orderData.firstName,
            lastName: orderData.lastName,
            address: orderData.address,
            city: orderData.city,
            postalCode: orderData.postalCode,
            country: orderData.country,
            phone: orderData.phone,
          },
          billing_address: {
            firstName: orderData.firstName,
            lastName: orderData.lastName,
            address: orderData.address,
            city: orderData.city,
            postalCode: orderData.postalCode,
            country: orderData.country,
            phone: orderData.phone,
          },
          payment_status: "pending",
          payment_method: orderData.paymentMethod,
          notes: orderData.notes,
        },
      })

      // Create order items
      const orderItems = await Promise.all(
        orderData.items.map((item: any) =>
          tx.orderItem.create({
            data: {
              order_id: newOrder.id,
              product_id: BigInt(item.product.id),
              quantity: item.quantity,
              price: item.product.price,
              total: item.product.price * item.quantity,
            },
          })
        )
      )

      return {
        ...newOrder,
        items: orderItems,
      }
    })

    console.log('✅ Order created successfully!')
    console.log(`   Order ID: ${order.id}`)
    console.log(`   Total: ${order.total_amount} ${order.currency}`)
    console.log(`   Status: ${order.status}`)
    console.log(`   Items: ${order.items.length}`)

    // Verify the order was created correctly
    const verifyOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
              }
            }
          }
        }
      }
    })

    if (verifyOrder) {
      console.log('\n🔍 Order verification:')
      console.log(`   Email: ${verifyOrder.email}`)
      console.log(`   Shipping Address: ${verifyOrder.shipping_address.firstName} ${verifyOrder.shipping_address.lastName}`)
      console.log(`   Items: ${verifyOrder.items.length}`)
      verifyOrder.items.forEach((item, index) => {
        console.log(`     ${index + 1}. ${item.product.name} x${item.quantity} = ${item.total} ${verifyOrder.currency}`)
      })
    }

    console.log('\n🎯 Order creation test completed successfully!')
    console.log('📝 The checkout process should now save orders to the database.')

  } catch (error) {
    console.error('❌ Error testing order creation:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testOrderCreation()
