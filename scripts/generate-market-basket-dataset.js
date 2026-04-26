const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function toNumber(value, fallback = 0) {
  if (value === null || value === undefined) return fallback;
  return Number(value);
}

function sampleOne(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function sampleUnique(items, count) {
  const copy = [...items];
  const result = [];
  const n = Math.min(count, copy.length);
  for (let i = 0; i < n; i += 1) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return result;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDateWithinDays(daysBack) {
  const now = Date.now();
  const delta = Math.floor(Math.random() * daysBack * 24 * 60 * 60 * 1000);
  return new Date(now - delta);
}

function csvEscape(value) {
  const s = String(value ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(rows, headers) {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => csvEscape(row[h])).join(","));
  }
  return `${lines.join("\n")}\n`;
}

async function main() {
  const outputDir = path.join(process.cwd(), "data", "market_basket");
  fs.mkdirSync(outputDir, { recursive: true });

  const products = await prisma.product.findMany({
    where: { is_active: true },
    include: {
      brand: true,
      category: true,
    },
    orderBy: { id: "asc" },
  });

  if (!products.length) {
    throw new Error("No active products found. Seed/import products first.");
  }

  const globalNonZeroPrices = products.map((p) => toNumber(p.price)).filter((x) => x > 0);
  const globalFallbackPrice =
    globalNonZeroPrices.length > 0
      ? globalNonZeroPrices.reduce((a, b) => a + b, 0) / globalNonZeroPrices.length
      : 30;

  const categoryPriceAverages = new Map();
  for (const p of products) {
    const cat = p.category?.name ?? "Uncategorized";
    if (!categoryPriceAverages.has(cat)) {
      categoryPriceAverages.set(cat, { sum: 0, count: 0 });
    }
    const price = toNumber(p.price);
    if (price > 0) {
      const entry = categoryPriceAverages.get(cat);
      entry.sum += price;
      entry.count += 1;
    }
  }

  const effectivePriceByProductId = new Map();
  for (const p of products) {
    const rawPrice = toNumber(p.price);
    if (rawPrice > 0) {
      effectivePriceByProductId.set(p.id.toString(), rawPrice);
      continue;
    }

    const cat = p.category?.name ?? "Uncategorized";
    const catStats = categoryPriceAverages.get(cat);
    let imputed = globalFallbackPrice;
    if (catStats && catStats.count > 0) {
      imputed = catStats.sum / catStats.count;
    }

    // Small noise keeps products from becoming identical in synthetic baskets.
    const noiseFactor = 0.85 + Math.random() * 0.3;
    const rounded = Math.round(imputed * noiseFactor * 100) / 100;
    effectivePriceByProductId.set(p.id.toString(), Math.max(5, rounded));
  }

  const productsCatalog = products.map((p) => ({
    product_id: p.id.toString(),
    slug: p.slug,
    name: p.name,
    brand: p.brand?.name ?? "Unknown",
    category: p.category?.name ?? "Uncategorized",
    db_price: toNumber(p.price).toFixed(2),
    effective_price: toNumber(effectivePriceByProductId.get(p.id.toString())).toFixed(2),
    currency: p.currency,
    is_featured: p.is_featured ? 1 : 0,
    avg_rating: toNumber(p.avg_rating).toFixed(2),
    reviews_count: p.reviews_count,
    total_sold: p.total_sold.toString(),
    stock_quantity: p.stock_quantity,
    tags: (p.tags ?? []).join("|"),
  }));

  const byCategory = new Map();
  for (const p of products) {
    const key = p.category?.name ?? "Uncategorized";
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key).push(p);
  }

  const categories = [...byCategory.keys()];
  const topCategories = categories
    .map((name) => ({ name, size: byCategory.get(name).length }))
    .sort((a, b) => b.size - a.size)
    .slice(0, Math.min(6, categories.length))
    .map((x) => x.name);

  const customerCount = 260;
  const orderCount = 1600;
  const customers = Array.from({ length: customerCount }, (_, i) => `CUST_${String(i + 1).padStart(4, "0")}`);

  const orderItems = [];
  const customerStats = new Map();

  for (const customerId of customers) {
    customerStats.set(customerId, {
      orders: 0,
      totalSpend: 0,
      totalItems: 0,
      distinctProducts: new Set(),
      categories: new Map(),
      weekdays: [0, 0, 0, 0, 0, 0, 0],
    });
  }

  for (let o = 1; o <= orderCount; o += 1) {
    const orderId = `ORD_${String(o).padStart(6, "0")}`;
    const customerId = sampleOne(customers);
    const focusCategory = sampleOne(topCategories.length ? topCategories : categories);
    const fromFocus = byCategory.get(focusCategory) ?? [];

    let basketSize = randomInt(1, 5);
    if (Math.random() < 0.12) basketSize = randomInt(5, 8);

    const focusCount = Math.max(1, Math.min(fromFocus.length, Math.ceil(basketSize * 0.6)));
    const primaryProducts = sampleUnique(fromFocus, focusCount);

    const remaining = basketSize - primaryProducts.length;
    const secondaryPool = products.filter((p) => !primaryProducts.includes(p));
    const secondaryProducts = sampleUnique(secondaryPool, Math.max(0, remaining));

    const basket = [...primaryProducts, ...secondaryProducts];
    const orderDate = randomDateWithinDays(365);
    const weekday = orderDate.getDay();

    let orderTotal = 0;
    let orderItemsCount = 0;

    for (const p of basket) {
      const qty = Math.random() < 0.8 ? 1 : randomInt(2, 4);
      const price = toNumber(effectivePriceByProductId.get(p.id.toString()), globalFallbackPrice);
      const lineTotal = qty * price;

      orderItems.push({
        order_id: orderId,
        customer_id: customerId,
        order_date: orderDate.toISOString().slice(0, 10),
        weekday,
        product_id: p.id.toString(),
        product_name: p.name,
        category: p.category?.name ?? "Uncategorized",
        brand: p.brand?.name ?? "Unknown",
        unit_price: price.toFixed(2),
        quantity: qty,
        line_total: lineTotal.toFixed(2),
      });

      orderTotal += lineTotal;
      orderItemsCount += qty;
    }

    const stat = customerStats.get(customerId);
    stat.orders += 1;
    stat.totalSpend += orderTotal;
    stat.totalItems += orderItemsCount;
    stat.weekdays[weekday] += 1;
    for (const p of basket) {
      stat.distinctProducts.add(p.id.toString());
      const cat = p.category?.name ?? "Uncategorized";
      stat.categories.set(cat, (stat.categories.get(cat) ?? 0) + 1);
    }
  }

  const customerFeatures = customers.map((customerId) => {
    const s = customerStats.get(customerId);
    const avgOrderValue = s.orders ? s.totalSpend / s.orders : 0;
    const avgItemsPerOrder = s.orders ? s.totalItems / s.orders : 0;

    const sortedCats = [...s.categories.entries()].sort((a, b) => b[1] - a[1]);
    const favoriteCategory = sortedCats.length ? sortedCats[0][0] : "Unknown";

    const weekendOrders = s.weekdays[0] + s.weekdays[6];
    const weekendRatio = s.orders ? weekendOrders / s.orders : 0;

    let segment = "regular";
    if (s.orders >= 12 && avgOrderValue >= 70) segment = "high_value";
    else if (s.orders <= 3 && avgOrderValue < 45) segment = "low_activity";
    else if (s.orders >= 8 && weekendRatio >= 0.45) segment = "weekend_shopper";

    return {
      customer_id: customerId,
      orders_count: s.orders,
      total_spend: s.totalSpend.toFixed(2),
      avg_order_value: avgOrderValue.toFixed(2),
      total_items: s.totalItems,
      avg_items_per_order: avgItemsPerOrder.toFixed(2),
      distinct_products: s.distinctProducts.size,
      favorite_category: favoriteCategory,
      weekend_order_ratio: weekendRatio.toFixed(3),
      segment_hint: segment,
    };
  });

  fs.writeFileSync(
    path.join(outputDir, "products_catalog.csv"),
    toCsv(productsCatalog, [
      "product_id",
      "slug",
      "name",
      "brand",
      "category",
      "db_price",
      "effective_price",
      "currency",
      "is_featured",
      "avg_rating",
      "reviews_count",
      "total_sold",
      "stock_quantity",
      "tags",
    ])
  );

  fs.writeFileSync(
    path.join(outputDir, "order_items_dataset.csv"),
    toCsv(orderItems, [
      "order_id",
      "customer_id",
      "order_date",
      "weekday",
      "product_id",
      "product_name",
      "category",
      "brand",
      "unit_price",
      "quantity",
      "line_total",
    ])
  );

  fs.writeFileSync(
    path.join(outputDir, "customer_features_for_clustering.csv"),
    toCsv(customerFeatures, [
      "customer_id",
      "orders_count",
      "total_spend",
      "avg_order_value",
      "total_items",
      "avg_items_per_order",
      "distinct_products",
      "favorite_category",
      "weekend_order_ratio",
      "segment_hint",
    ])
  );

  const readme = `# Market Basket Dataset

This dataset is generated from active products in your Prisma database and synthetic but coherent customer/order behavior.

## Files

- products_catalog.csv: Product master data from Prisma products table.
- order_items_dataset.csv: Basket-level order line items for association rules mining.
- customer_features_for_clustering.csv: Customer-level aggregated features for clustering.

## Notes

- Product names, ids, brands, categories, and pricing come from your real database.
- Orders and customer behavior are simulated to preserve realistic co-purchase patterns.
- Use order_id grouping to build transactions for Apriori / FP-Growth.
- Scale numeric columns before K-Means / DBSCAN.
`;

  fs.writeFileSync(path.join(outputDir, "README.md"), readme);

  console.log(`Generated dataset in ${outputDir}`);
  console.log(`Products: ${productsCatalog.length}`);
  console.log(`Order-item rows: ${orderItems.length}`);
  console.log(`Customers: ${customerFeatures.length}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
