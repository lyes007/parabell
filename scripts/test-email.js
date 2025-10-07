const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmailService() {
  console.log('🧪 Testing Email Service...\n');

  // Check environment variables
  console.log('📋 Checking environment variables:');
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Set' : '❌ Missing'}`);
  console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing'}`);
  console.log(`ADMIN_EMAIL: ${process.env.ADMIN_EMAIL ? '✅ Set' : '❌ Not set (optional)'}\n`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email credentials not configured!');
    console.log('Please add to your .env file:');
    console.log('EMAIL_USER="your-gmail@gmail.com"');
    console.log('EMAIL_PASS="your-16-character-app-password"');
    return;
  }

  try {
    // Create transporter
    console.log('🔧 Creating email transporter...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Test connection
    console.log('🔍 Testing connection to Gmail...');
    await transporter.verify();
    console.log('✅ Connection successful!\n');

    // Test email data
    const testData = {
      orderId: 'TEST-' + Date.now(),
      customerName: 'Test Customer',
      customerEmail: process.env.EMAIL_USER, // Send to yourself for testing
      customerPhone: '+1234567890',
      totalAmount: 99.99,
      currency: 'TND',
      items: [
        { name: 'Test Product 1', quantity: 2, price: 25.00 },
        { name: 'Test Product 2', quantity: 1, price: 49.99 }
      ],
      shippingAddress: {
        address: '123 Test Street',
        city: 'Test City',
        postalCode: '1000',
        country: 'Tunisia'
      },
      paymentMethod: 'cash_on_delivery'
    };

    // Generate test email
    const itemsHTML = testData.items
      .map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${testData.currency} ${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Email Test</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #96A78D; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th { background: #96A78D; color: white; padding: 10px; text-align: left; }
          .total { font-size: 18px; font-weight: bold; color: #96A78D; }
          .test-notice { background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧪 Email Test</h1>
            <p>Testing Para Bell Email Service</p>
          </div>
          
          <div class="content">
            <div class="test-notice">
              <strong>This is a test email!</strong> If you receive this, your email service is working correctly.
            </div>
            
            <p>Hello <strong>${testData.customerName}</strong>,</p>
            
            <p>This is a test of the email notification system for Para Bell e-commerce.</p>
            
            <div class="order-details">
              <h3>Test Order #${testData.orderId}</h3>
              
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>
              
              <div style="text-align: right; margin-top: 15px;">
                <span class="total">Total: ${testData.currency} ${testData.totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <div class="order-details">
              <h3>Test Information</h3>
              <p><strong>Customer Email:</strong> ${testData.customerEmail}</p>
              <p><strong>Phone:</strong> ${testData.customerPhone}</p>
              <p><strong>Payment Method:</strong> ${testData.paymentMethod.replace('_', ' ').toUpperCase()}</p>
            </div>
            
            <p>✅ <strong>Email service is working correctly!</strong></p>
            <p>You can now place real orders and receive email notifications.</p>
            
            <div style="text-align: center; margin-top: 20px; color: #666;">
              <p>Best regards,<br><strong>Para Bell Team</strong></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send test email
    console.log('📧 Sending test email...');
    const result = await transporter.sendMail({
      from: `"Para Bell Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: `🧪 Email Test - Para Bell Service Working!`,
      html: htmlContent,
      text: `
🧪 Email Test - Para Bell Service

Hello ${testData.customerName},

This is a test of the email notification system for Para Bell e-commerce.

Test Order #${testData.orderId}

Items:
${testData.items.map(item => `• ${item.name} (x${item.quantity}) - ${testData.currency} ${(item.price * item.quantity).toFixed(2)}`).join('\n')}

Total: ${testData.currency} ${testData.totalAmount.toFixed(2)}

Customer Email: ${testData.customerEmail}
Phone: ${testData.customerPhone}
Payment Method: ${testData.paymentMethod.replace('_', ' ').toUpperCase()}

✅ Email service is working correctly!
You can now place real orders and receive email notifications.

Best regards,
Para Bell Team
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log(`📧 Message ID: ${result.messageId}`);
    console.log(`📬 Sent to: ${process.env.EMAIL_USER}`);
    console.log('\n🎉 Email service is working correctly!');
    console.log('Check your inbox for the test email.');

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n💡 Troubleshooting:');
      console.log('1. Make sure you\'re using the App Password, not your regular Gmail password');
      console.log('2. Verify that 2-Step Verification is enabled in your Google Account');
      console.log('3. Check that the App Password is exactly 16 characters');
    } else if (error.message.includes('Less secure app access')) {
      console.log('\n💡 Troubleshooting:');
      console.log('1. Enable 2-Step Verification in your Google Account');
      console.log('2. Generate a new App Password');
      console.log('3. Use the App Password instead of your regular password');
    }
  }
}

// Run the test
testEmailService().catch(console.error);
