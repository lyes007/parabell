# Email Notification Test Setup

## Step 1: Create Your .env File

Create a file called `.env` in your project root with the following content:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/para_bell_ecommerce?schema=public"

# Next.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Email Configuration (FREE with Gmail)
EMAIL_USER="your-gmail@gmail.com"
EMAIL_PASS="your-16-character-app-password"
ADMIN_EMAIL="admin@gmail.com"
```

## Step 2: Get Your Gmail App Password

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click **"Security"** → **"2-Step Verification"** (enable if not already)
3. Go to **"App passwords"**
4. Select **"Mail"** → **"Other (Custom name)"**
5. Enter "Para Bell E-commerce"
6. Copy the 16-character password
7. Replace `your-16-character-app-password` in your `.env` file

## Step 3: Test Email Service

Run this command to test your email setup:

```bash
node scripts/test-email.js
```

## Expected Output

If everything is working, you should see:

```
🧪 Testing Email Service...

📋 Checking environment variables:
EMAIL_USER: ✅ Set
EMAIL_PASS: ✅ Set
ADMIN_EMAIL: ✅ Set

🔧 Creating email transporter...
🔍 Testing connection to Gmail...
✅ Connection successful!

📧 Sending test email...
✅ Test email sent successfully!
📧 Message ID: <message-id>
📬 Sent to: your-gmail@gmail.com

🎉 Email service is working correctly!
Check your inbox for the test email.
```

## Troubleshooting

### If you get "Invalid login":
- Make sure you're using the App Password, not your regular Gmail password
- Verify 2-Step Verification is enabled
- Check the App Password is exactly 16 characters

### If you get "App passwords aren't available":
- Enable 2-Step Verification first
- Wait a few minutes and try again
- Use a personal Gmail account (not work/school)

### If emails go to spam:
- Check your spam folder
- Add your sending email to contacts
- This is normal for new email addresses

## Test with Real Order

Once the test passes:

1. Start your development server: `pnpm dev`
2. Go to your website
3. Place a test order with a real email address
4. Check both your email and the customer's email
5. Look for console logs showing email status

## What You'll Receive

### Customer Email:
- Beautiful HTML order confirmation
- Order details and items
- Shipping information
- Professional branding

### Admin Email:
- New order alert
- Customer information
- Complete order details
- Action required notice

Your email notification system will work automatically for all orders!
