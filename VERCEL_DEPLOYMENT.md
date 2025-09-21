# Vercel Deployment Guide

## Environment Variables Required

You need to set these environment variables in your Vercel dashboard:

### 1. Database Connection
```
DATABASE_URL=your_postgresql_connection_string
```

### 2. Base URL (Optional - Vercel will auto-detect)
```
NEXT_PUBLIC_BASE_URL=https://your-app-name.vercel.app
```

## Steps to Fix 404 Errors

### 1. Set Environment Variables in Vercel
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add the `DATABASE_URL` variable with your PostgreSQL connection string
5. Optionally add `NEXT_PUBLIC_BASE_URL` with your Vercel app URL

### 2. Redeploy Your Application
After setting the environment variables:
1. Go to the Deployments tab in Vercel
2. Click "Redeploy" on your latest deployment
3. Or push a new commit to trigger a new deployment

### 3. Database Setup
Make sure your database is accessible from Vercel:
1. If using a local database, you'll need to use a cloud database (like Neon, Supabase, or PlanetScale)
2. Run database migrations: `npx prisma migrate deploy`
3. Seed your database if needed: `npx prisma db seed`

## Common Issues and Solutions

### Issue: 404 on Product Pages
**Cause**: Missing `generateStaticParams` or database connection issues
**Solution**: The updated code now includes:
- `generateStaticParams()` to pre-generate all product routes
- `dynamic = 'force-dynamic'` to ensure proper rendering
- Fallback API calls if direct database access fails

### Issue: Database Connection Errors
**Cause**: Missing or incorrect `DATABASE_URL`
**Solution**: 
1. Verify your database connection string
2. Ensure your database allows connections from Vercel's IP ranges
3. Check if your database requires SSL connections

### Issue: Build Failures
**Cause**: Missing environment variables during build
**Solution**:
1. Set all required environment variables in Vercel
2. Use `npx prisma generate` before building
3. Ensure all dependencies are properly installed

## Testing Your Deployment

1. Check if the main page loads: `https://your-app.vercel.app`
2. Check if products page loads: `https://your-app.vercel.app/products`
3. Test a specific product: `https://your-app.vercel.app/products/your-product-slug`

## Database Migration Commands

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (if you have seed data)
npx prisma db seed
```

## Vercel Build Command

Make sure your `package.json` has the correct build command:
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```
