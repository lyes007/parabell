import nodemailer from 'nodemailer'

export interface OrderEmailData {
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  totalAmount: number
  currency: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  shippingAddress: {
    address: string
    city: string
    postalCode: string
    country: string
  }
  paymentMethod: string
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null

  /**
   * Initialize the email transporter
   */
  private static async getTransporter(): Promise<nodemailer.Transporter | null> {
    if (this.transporter) {
      return this.transporter
    }

    try {
      // Check if email is configured
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Email credentials not configured, skipping email notifications')
        return null
      }

      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      })

      // Verify connection
      await this.transporter.verify()
      console.log('Email service ready')
      return this.transporter
    } catch (error) {
      console.error('Email service initialization failed:', error)
      this.transporter = null
      return null
    }
  }

  /**
   * Send order confirmation email to customer
   */
  static async sendOrderConfirmation(data: OrderEmailData): Promise<boolean> {
    try {
      const transporter = await this.getTransporter()
      if (!transporter) return false

      const mailOptions = {
        from: `"Para Bell" <${process.env.EMAIL_USER}>`,
        to: data.customerEmail,
        subject: `Order Confirmation #${data.orderId} - Para Bell`,
        html: this.generateCustomerEmailHTML(data),
        text: this.generateCustomerEmailText(data)
      }

      const result = await transporter.sendMail(mailOptions)
      console.log(`Order confirmation email sent to ${data.customerEmail}, Message ID: ${result.messageId}`)
      return true
    } catch (error) {
      console.error('Failed to send order confirmation email:', error)
      return false
    }
  }

  /**
   * Send order notification email to admin
   */
  static async sendAdminNotification(data: OrderEmailData): Promise<boolean> {
    try {
      const transporter = await this.getTransporter()
      if (!transporter) return false

      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER
      if (!adminEmail) {
        console.warn('Admin email not configured')
        return false
      }

      const mailOptions = {
        from: `"Para Bell Orders" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `🛒 New Order #${data.orderId} - ${data.customerName}`,
        html: this.generateAdminEmailHTML(data),
        text: this.generateAdminEmailText(data)
      }

      const result = await transporter.sendMail(mailOptions)
      console.log(`Admin notification email sent, Message ID: ${result.messageId}`)
      return true
    } catch (error) {
      console.error('Failed to send admin notification email:', error)
      return false
    }
  }

  /**
   * Send both customer and admin emails
   */
  static async sendOrderNotifications(data: OrderEmailData): Promise<{
    customerSent: boolean
    adminSent: boolean
  }> {
    const [customerSent, adminSent] = await Promise.all([
      this.sendOrderConfirmation(data),
      this.sendAdminNotification(data)
    ])

    return { customerSent, adminSent }
  }

  /**
   * Generate HTML email for customer
   */
  private static generateCustomerEmailHTML(data: OrderEmailData): string {
    const itemsHTML = data.items
      .map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${data.currency} ${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `).join('')

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #96A78D; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th { background: #96A78D; color: white; padding: 10px; text-align: left; }
          .total { font-size: 18px; font-weight: bold; color: #96A78D; }
          .footer { text-align: center; margin-top: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Confirmation</h1>
            <p>Thank you for your order!</p>
          </div>
          
          <div class="content">
            <p>Hello <strong>${data.customerName}</strong>,</p>
            
            <p>We've received your order and are processing it. Here are the details:</p>
            
            <div class="order-details">
              <h3>Order #${data.orderId}</h3>
              
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
                <span class="total">Total: ${data.currency} ${data.totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <div class="order-details">
              <h3>Shipping Information</h3>
              <p>
                <strong>Address:</strong><br>
                ${data.shippingAddress.address}<br>
                ${data.shippingAddress.city}, ${data.shippingAddress.postalCode}<br>
                ${data.shippingAddress.country}
              </p>
              
              <p><strong>Payment Method:</strong> ${data.paymentMethod.replace('_', ' ').toUpperCase()}</p>
              ${data.customerPhone ? `<p><strong>Phone:</strong> ${data.customerPhone}</p>` : ''}
            </div>
            
            <p>We'll process your order shortly and send you tracking information once it ships.</p>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
            
            <div class="footer">
              <p>Best regards,<br><strong>Para Bell Team</strong></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Generate plain text email for customer
   */
  private static generateCustomerEmailText(data: OrderEmailData): string {
    const itemsText = data.items
      .map(item => `• ${item.name} (x${item.quantity}) - ${data.currency} ${(item.price * item.quantity).toFixed(2)}`)
      .join('\n')

    return `
🎉 Order Confirmation #${data.orderId}

Hello ${data.customerName},

Thank you for your order! Here are the details:

${itemsText}

Total: ${data.currency} ${data.totalAmount.toFixed(2)}

Shipping Information:
${data.shippingAddress.address}
${data.shippingAddress.city}, ${data.shippingAddress.postalCode}
${data.shippingAddress.country}

Payment Method: ${data.paymentMethod.replace('_', ' ').toUpperCase()}
${data.customerPhone ? `Phone: ${data.customerPhone}` : ''}

We'll process your order shortly and send you tracking information once it ships.

If you have any questions, please don't hesitate to contact us.

Best regards,
Para Bell Team
    `.trim()
  }

  /**
   * Generate HTML email for admin
   */
  private static generateAdminEmailHTML(data: OrderEmailData): string {
    const itemsHTML = data.items
      .map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${data.currency} ${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `).join('')

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Order Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th { background: #dc3545; color: white; padding: 10px; text-align: left; }
          .total { font-size: 18px; font-weight: bold; color: #dc3545; }
          .customer-info { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛒 New Order Alert</h1>
            <p>Order #${data.orderId}</p>
          </div>
          
          <div class="content">
            <div class="customer-info">
              <h3>Customer Information</h3>
              <p><strong>Name:</strong> ${data.customerName}</p>
              <p><strong>Email:</strong> ${data.customerEmail}</p>
              ${data.customerPhone ? `<p><strong>Phone:</strong> ${data.customerPhone}</p>` : ''}
            </div>
            
            <div class="order-details">
              <h3>Order Details</h3>
              
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
                <span class="total">Total: ${data.currency} ${data.totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <div class="order-details">
              <h3>Shipping Information</h3>
              <p>
                <strong>Address:</strong><br>
                ${data.shippingAddress.address}<br>
                ${data.shippingAddress.city}, ${data.shippingAddress.postalCode}<br>
                ${data.shippingAddress.country}
              </p>
              
              <p><strong>Payment Method:</strong> ${data.paymentMethod.replace('_', ' ').toUpperCase()}</p>
            </div>
            
            <p style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
              <strong>Action Required:</strong> Please process this order promptly and update the customer with tracking information.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Generate plain text email for admin
   */
  private static generateAdminEmailText(data: OrderEmailData): string {
    const itemsText = data.items
      .map(item => `• ${item.name} (x${item.quantity}) - ${data.currency} ${(item.price * item.quantity).toFixed(2)}`)
      .join('\n')

    return `
🛒 New Order Alert #${data.orderId}

Customer Information:
Name: ${data.customerName}
Email: ${data.customerEmail}
${data.customerPhone ? `Phone: ${data.customerPhone}` : ''}

Order Details:
${itemsText}

Total: ${data.currency} ${data.totalAmount.toFixed(2)}

Shipping Information:
${data.shippingAddress.address}
${data.shippingAddress.city}, ${data.shippingAddress.postalCode}
${data.shippingAddress.country}

Payment Method: ${data.paymentMethod.replace('_', ' ').toUpperCase()}

ACTION REQUIRED: Please process this order promptly and update the customer with tracking information.
    `.trim()
  }
}
