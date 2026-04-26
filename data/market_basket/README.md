# Market Basket Dataset

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
