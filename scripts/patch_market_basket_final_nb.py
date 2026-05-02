"""
One-off patch: switch market_basket_final.ipynb Apriori to product_id columns,
add product_id_reference + single_rules_readable tables, update chart labels and docs.
Run from repo root: python scripts/patch_market_basket_final_nb.py
"""
from __future__ import annotations

import json
from pathlib import Path


def src_lines(s: str) -> list[str]:
    lines = s.splitlines(keepends=True)
    if lines and not lines[-1].endswith("\n"):
        lines[-1] += "\n"
    return lines


def patch_cell(nb: dict, cell_id: str, new_source: str, clear_outputs: bool = True) -> bool:
    for c in nb["cells"]:
        if c.get("id") != cell_id:
            continue
        c["source"] = src_lines(new_source)
        if clear_outputs:
            c["outputs"] = []
            c["execution_count"] = None
        return True
    raise SystemExit(f"Cell id not found: {cell_id}")


def main() -> None:
    nb_path = Path(__file__).resolve().parent.parent / "web analytics project" / "market_basket_final.ipynb"
    nb = json.loads(nb_path.read_text(encoding="utf-8"))

    # --- Part 1 intro (optional clarity) ---
    patch_cell(
        nb,
        "6d1b579c",
        """---
## Part 1 — Loading and understanding the data

Before doing any analysis, it's worth spending a moment to understand the raw data. Each row in the order items file represents a single product line inside an order — so one order with three products produces three rows. We'll collapse these into full baskets for association rule mining.

**Association mining uses `product_id` (as stable string keys)** so rules line up with your database. A separate **reference table** maps each id to `product_name`, brand, and category so you can read the results easily.""",
    )

    patch_cell(
        nb,
        "43118276",
        """# Quick data quality check before we go any further.
# We need order_id, product_id, product_name, customer_id, and weekday at a minimum.
# We also look for a price column — the analysis is much better with real prices.

orders = orders.dropna(subset=["order_id", "product_name", "product_id"])

required = {"order_id", "product_id", "product_name", "customer_id", "weekday"}
missing_cols = required - set(orders.columns)

if missing_cols:
    print(f"WARNING — these columns are missing: {missing_cols}")
    print("Some features may fall back to proxy values.")
else:
    print("All required columns are present.")

# Pick the best available price column
if "line_total" in orders.columns:
    PRICE_COL = "line_total"
elif "unit_price" in orders.columns:
    PRICE_COL = "unit_price"
else:
    PRICE_COL = None
    print("No price column found — order clustering will use a rough proxy.")

print(f"Price column: {PRICE_COL}")""",
    )

    patch_cell(
        nb,
        "dbbf1b42",
        """# Group from individual lines into full baskets.
# Each transaction is one complete order — the full list of product IDs bought together.
# We use string product_id so columns match Prisma / Postgres BigInt string form.
# We deduplicate so that scanning the same item twice doesn't distort the rules.

orders["product_id_str"] = orders["product_id"].astype(str)

# One row per product_id for reading results (separate from the mining matrix)
id_to_name = (
    orders.drop_duplicates("product_id_str")
    .set_index("product_id_str")["product_name"]
    .to_dict()
)

product_id_reference = (
    orders.drop_duplicates("product_id_str")[
        ["product_id_str", "product_name", "brand", "category"]
    ]
    .rename(columns={"product_id_str": "product_id"})
    .sort_values("product_id", key=lambda s: s.astype(int))
    .reset_index(drop=True)
)

transactions = (
    orders.groupby("order_id")["product_id_str"]
    .apply(lambda items: sorted(set(items)))
    .tolist()
)

sizes = [len(t) for t in transactions]

print(f"Total baskets  : {len(transactions):,}")
print(f"Smallest basket: {min(sizes)} item")
print(f"Largest basket : {max(sizes)} items")
print(f"Average basket : {sum(sizes)/len(sizes):.2f} items")
print()
print("Example basket (product IDs):", transactions[0])
print("Same basket (product names):", [id_to_name[i] for i in transactions[0]])
print()
print("product_id_reference — use this table to read id-based rules:")
product_id_reference.head(15)""",
    )

    patch_cell(
        nb,
        "e5f41de9",
        """---
## Part 2 — Finding products that go together (Apriori)

The Apriori algorithm works by first finding individual products that appear frequently, then checking whether pairs of those products appear together frequently, then triples, and so on. At each step it throws away anything below our minimum frequency threshold, which keeps things manageable.

**We encode each basket as a set of `product_id` strings** (not display names), so frequent itemsets and rules use the same identifiers as your database. Part 3 adds a **human-readable companion table** next to the raw id rules.

We'll set the threshold at **1% support** — meaning a product or combination has to appear in at least 1 in every 100 baskets (roughly 16 orders out of our 1,600). That's a reasonable bar: strict enough to filter out coincidences, loose enough to catch real patterns in a dataset of this size.""",
    )

    patch_cell(
        nb,
        "cc0b5494",
        """# Step 1 — convert the basket lists into a big True/False table.
# Each column is one product_id (string). Each row is an order.
# A cell is True if that product appeared in that order.

te = TransactionEncoder()
te_ary = te.fit(transactions).transform(transactions)
df_bool = pd.DataFrame(te_ary, columns=te.columns_)

print(f"One-hot table shape: {df_bool.shape}")
print(f"({df_bool.shape[0]} orders × {df_bool.shape[1]} unique product_ids)")""",
    )

    patch_cell(
        nb,
        "8cb2700c",
        """# Step 2 — run Apriori to find frequent itemsets.
# use_colnames=True → column names are product_id strings (from TransactionEncoder).

MIN_SUPPORT = 0.01  # 1% of all baskets

itemsets = apriori(df_bool, min_support=MIN_SUPPORT, use_colnames=True)
itemsets = itemsets.sort_values("support", ascending=False)

print(f"Frequent itemsets found: {len(itemsets)}")
print()
print("Top 15 most common itemsets (ids — map names with product_id_reference):")
itemsets.head(15)""",
    )

    patch_cell(
        nb,
        "868d0fe5",
        """---
## Part 3 — Turning itemsets into actionable recommendation rules

Knowing that two products are often bought together is useful, but what we really want is directional rules: **\"customers who buy product A tend to also buy product B\"**. That's what association rules give us.

Three metrics tell us whether a rule is worth using:

| Metric | Plain English |
|--------|---------------|
| **Support** | Out of all orders, how many contained both A and B? (1% = 16 orders in our dataset) |
| **Confidence** | Of all orders containing A, what fraction also contained B? |
| **Lift** | How much more likely is B given A, compared to B appearing at random? Lift > 1 means there's a real connection. Lift of 6 means 6 times more likely — that's a strong signal. |

We'll keep only rules where:
- Confidence is at least 20% (the co-purchase happens in at least 1 in 5 relevant orders)
- Lift is greater than 1 (so it's not just coincidence)
- The rule has a single product on the left side — these are the most practical for a \"customers also bought\" widget

**Mining uses `product_id` in `antecedents` / `consequents`.** The next code cell prints the same rules with a **separate readable table** (`single_rules_readable`) with names for interpretation and reporting.""",
    )

    patch_cell(
        nb,
        "2a77d69a",
        """# Generate the full set of association rules (item columns = product_id strings)
rules = association_rules(
    itemsets,
    num_itemsets=len(itemsets),
    metric="confidence",
    min_threshold=0.20,
)

# Filter to rules with a real signal (lift > 1)
rules = rules[rules["lift"] > 1].copy()

# Filter to single-product antecedents — most useful for product pages
rules["antecedent_len"] = rules["antecedents"].apply(len)
single_rules = (
    rules[rules["antecedent_len"] == 1]
    .sort_values(["lift", "confidence"], ascending=False)
    .reset_index(drop=True)
)


def frozenset_ids_to_names(fs: frozenset) -> str:
    return " | ".join(id_to_name.get(str(x), str(x)) for x in sorted(fs))


# Separate human-readable view (for you / the report / stakeholders)
single_rules_readable = pd.DataFrame(
    {
        "antecedent_product_id": single_rules["antecedents"].apply(lambda s: str(list(s)[0])),
        "antecedent_name": single_rules["antecedents"].apply(
            lambda s: id_to_name.get(str(list(s)[0]), "?")
        ),
        "consequent_product_ids": single_rules["consequents"].apply(
            lambda s: "|".join(sorted(str(x) for x in s))
        ),
        "consequent_names": single_rules["consequents"].apply(frozenset_ids_to_names),
        "support": single_rules["support"],
        "confidence": single_rules["confidence"],
        "lift": single_rules["lift"],
    }
)

print(f"Total rules with lift > 1   : {len(rules)}")
print(f"Single-antecedent rules     : {len(single_rules)}")
print()

print("--- Raw rules (Apriori / mlxtend: antecedents & consequents are frozensets of product_id) ---")
cols = ["antecedents", "consequents", "support", "confidence", "lift"]
print(single_rules[cols].head(20).to_string())

print()
print("--- Same rules with names (for understanding; use ids for PDP / database) ---")
single_rules_readable.head(20)""",
    )

    patch_cell(
        nb,
        "31bfe41d",
        """# Visualise the top rules — a horizontal bar chart is easier to read than a table
# when you want to quickly compare lift values across rules.
# Labels use product names (from id_to_name) even though mining ran on ids.

top_n = 12
top = single_rules.head(top_n).copy()


def shorten(name, max_len=28):
    return name[:max_len] + "…" if len(name) > max_len else name


def rule_label_from_ids(a, c):
    a_id = str(list(a)[0])
    a_name = id_to_name.get(a_id, a_id)
    c_names = [id_to_name.get(str(x), str(x)) for x in sorted(c)]
    c_str = " + ".join(c_names)
    return f"{shorten(a_name)}  →  {shorten(c_str, 40)}"


top["rule_label"] = [
    rule_label_from_ids(a, c) for a, c in zip(top["antecedents"], top["consequents"])
]

fig, ax = plt.subplots(figsize=(10, 5))

bars = ax.barh(
    top["rule_label"][::-1],
    top["lift"][::-1],
    color="#378ADD",
    edgecolor="white",
    linewidth=0.5,
)

ax.set_xlabel("Lift", fontsize=11)
ax.set_title(f"Top {top_n} association rules by lift (labels = product names)", fontsize=13, fontweight="500", pad=12)
ax.xaxis.set_major_locator(mticker.MaxNLocator(integer=True))
ax.set_xlim(0, top["lift"].max() * 1.15)

plt.tight_layout()
plt.show()

print()
print("Reading note:")
print("All top rules come in symmetric pairs — A→B and B→A have the same lift.")
print("This means neither product 'leads' the other. You can recommend from either side.")
print()
print("Caveat on support:")
print(f"1% support on {len(transactions):,} orders = ~{int(len(transactions) * 0.01)} orders per rule.")
print("Rules are valid but thin. Re-run on 6–12 months of data before deploying to production.")""",
    )

    patch_cell(
        nb,
        "bf3c09ac",
        """### What these rules mean in practice

The four strongest co-purchase pairs, explained simply:

- **Gel Nettoyant Crèmeux ↔ Sérum hydratant** (lift 6.22) — these two skin-care products are bought together 6× more often than chance would predict. Anyone viewing one on a product page should see the other suggested.

- **Mirawhite Shine ↔ Kid's Brush** (lift 6.15) — a whitening toothpaste and a children's toothbrush. Possibly a household buying both adult and kids' oral care in one shop. Cross-promote in the oral care category.

- **MAGNOLIA Crème Mains ↔ CASSIS Sérum Mains** (lift 6.10) — two hand-care products from the same range. Customers buying into this line tend to complete the routine.

- **Shampoing Cheveux Sec ↔ Shampoing Anti-Chute Gras** (lift 6.03) — two different shampoo types bought together, likely by multi-person households.

**For the recommender engine:** use the **`antecedent_product_id`** column in `single_rules_readable` (or parse the single-element `antecedents` frozenset from `single_rules`) to match the current PDP product id. Recommend products listed in **`consequent_product_ids`** / **`consequent_names`**.""",
    )

    patch_cell(
        nb,
        "84711045",
        """# Build one row per order by aggregating across the line items.
# We capture: item count, product variety, total spend, and average price per item.

agg_dict = {
    "num_items": ("product_id", "count"),
    "distinct_items": ("product_id", "nunique"),
}

if PRICE_COL is not None:
    agg_dict["total_price"] = (PRICE_COL, "sum")

order_features = (
    orders.groupby("order_id").agg(**agg_dict).reset_index()
)

# Fallback: only if there truly is no price column in the source data
if PRICE_COL is None:
    print("No price column available — using a rough proxy (item count × random unit price).")
    print("Replace this with real price data for accurate results.")
    rng = np.random.default_rng(42)
    order_features["total_price"] = (
        order_features["num_items"] * rng.uniform(8, 40, len(order_features))
    ).round(2)
else:
    print(f"Prices taken from real '{PRICE_COL}' column.")

# Average price per item helps distinguish "2 cheap items" from "2 expensive items"
order_features["avg_item_price"] = (
    order_features["total_price"] / order_features["num_items"]
).round(2)

print(f"\nOrder features built for {len(order_features):,} orders.")
print()
order_features.head(8)""",
    )

    patch_cell(
        nb,
        "4db10b6b",
        """### Association rules

We mine baskets on **`product_id`** (same keys as the database). We still find **139 single-antecedent rules** with lift > 1. The strongest pairs have lift around 6, which is a strong signal for a dataset of this size. All top rules are symmetric — the co-purchase goes both ways — so you can safely recommend from either side of a pair.

Use **`single_rules_readable`** for reporting and stakeholder review; use **`single_rules`** (or the `antecedent_product_id` column) when wiring the website / PDP.""",
    )

    nb_path.write_text(json.dumps(nb, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print("Patched", nb_path)


if __name__ == "__main__":
    main()
