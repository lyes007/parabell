"""
Export Apriori association rules (single-antecedent, lift > 1) to JSON for the Next.js app.
Mirrors the notebook: product_id columns, min_support=0.01, confidence >= 0.20.

Run from repo root: python scripts/export_association_rules.py
Default CSV: data/market_basket/order_items_dataset.csv
Output: lib/association_rules.json (tracked for Vercel; /data may be gitignored)
"""
from __future__ import annotations

import json
from pathlib import Path

import pandas as pd
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    csv_path = root / "data" / "market_basket" / "order_items_dataset.csv"
    out_path = root / "lib" / "association_rules.json"

    orders = pd.read_csv(csv_path)
    orders["product_id_str"] = orders["product_id"].astype(str)

    transactions = (
        orders.groupby("order_id")["product_id_str"]
        .apply(lambda items: sorted(set(items)))
        .tolist()
    )

    te = TransactionEncoder()
    df_bool = pd.DataFrame(te.fit(transactions).transform(transactions), columns=te.columns_)

    MIN_SUPPORT = 0.01
    itemsets = apriori(df_bool, min_support=MIN_SUPPORT, use_colnames=True)

    rules = association_rules(
        itemsets,
        num_itemsets=len(itemsets),
        metric="confidence",
        min_threshold=0.20,
    )
    rules = rules[rules["lift"] > 1].copy()
    rules["antecedent_len"] = rules["antecedents"].apply(len)
    single = (
        rules[rules["antecedent_len"] == 1]
        .sort_values(["lift", "confidence"], ascending=False)
        .reset_index(drop=True)
    )

    exported = []
    for _, row in single.iterrows():
        ant = str(list(row["antecedents"])[0])
        cons = [str(x) for x in sorted(row["consequents"])]
        exported.append(
            {
                "antecedent": ant,
                "consequents": cons,
                "lift": float(row["lift"]),
                "confidence": float(row["confidence"]),
                "support": float(row["support"]),
            }
        )

    payload = {
        "generatedFrom": str(csv_path.relative_to(root)).replace("\\", "/"),
        "orderCount": len(transactions),
        "ruleCount": len(exported),
        "rules": exported,
    }

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Wrote {len(exported)} rules to {out_path}")


if __name__ == "__main__":
    main()
