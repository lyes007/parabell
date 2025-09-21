# Prisma Setup Instructions

## 🚀 Prisma is now configured for your project!

### What's been set up:

1. ✅ **Prisma Client** - Generated and ready to use
2. ✅ **Database Schema** - Complete e-commerce schema with models for:
   - Brands
   - Products (with comprehensive supplement/wellness fields)
   - Categories
   - Users
   - Carts & Cart Items
   - Orders & Order Items
   - Reviews
3. ✅ **Package Scripts** - Added to package.json:
   - `pnpm db:generate` - Generate Prisma client
   - `pnpm db:push` - Push schema to database
   - `pnpm db:migrate` - Run database migrations
   - `pnpm db:studio` - Open Prisma Studio
   - `pnpm db:seed` - Seed database with sample data
4. ✅ **Seed File** - Created with sample brands, categories, and products

### Next Steps:

#### 1. Set up your database
Create a `.env` file in your project root with your database connection:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/para_bell_ecommerce?schema=public"

# Next.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

#### 2. Choose your database setup method:

**Option A: Push schema to existing database**
```bash
pnpm db:push
```

**Option B: Create and run migrations (recommended for production)**
```bash
pnpm db:migrate
```

#### 3. Seed your database with sample data
```bash
pnpm db:seed
```

#### 4. Open Prisma Studio to view your data
```bash
pnpm db:studio
```

### Available Commands:

- `pnpm db:generate` - Generate Prisma client after schema changes
- `pnpm db:push` - Push schema changes to database (development)
- `pnpm db:migrate` - Create and apply migrations (production)
- `pnpm db:studio` - Open Prisma Studio GUI
- `pnpm db:seed` - Populate database with sample data

### Database Models:

Your schema includes comprehensive models for an e-commerce platform:

- **Brand** - Product brands with logos and descriptions
- **Product** - Detailed product model with pricing, inventory, supplements info
- **Category** - Hierarchical product categories
- **User** - User accounts and profiles
- **Cart/CartItem** - Shopping cart functionality
- **Order/OrderItem** - Order management
- **Review** - Product reviews and ratings

### Using Prisma in your code:

```typescript
import { prisma } from '@/lib/prisma'

// Example: Get all products
const products = await prisma.product.findMany({
  include: {
    brand: true,
    reviews: true
  }
})
```

### Need help?

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Client API Reference](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Database Setup Guide](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch)
