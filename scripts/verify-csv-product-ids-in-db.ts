/**
 * Verifies that every product_id referenced in market-basket CSVs exists in Postgres (Product table).
 *
 * Usage (from repo root):
 *   npx tsx scripts/verify-csv-product-ids-in-db.ts
 *
 * Requires DATABASE_URL in .env (same as Prisma). Do not commit secrets.
 */
import fs from "node:fs"
import path from "node:path"
import { config } from "dotenv"
import { PrismaClient } from "@prisma/client"

config({ path: path.resolve(process.cwd(), ".env") })

const ROOT = path.resolve(__dirname, "..")
const DATA_DIR = path.join(ROOT, "data", "market_basket")
const FILES = ["products_catalog.csv", "order_items_dataset.csv"] as const

function parseCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      inQuotes = !inQuotes
      continue
    }
    if (c === "," && !inQuotes) {
      out.push(cur)
      cur = ""
      continue
    }
    cur += c
  }
  out.push(cur)
  return out
}

function collectProductIdsFromCsv(filePath: string): Set<string> {
  const text = fs.readFileSync(filePath, "utf8")
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0)
  if (lines.length === 0) return new Set()

  const header = parseCsvLine(lines[0])
  const idx = header.indexOf("product_id")
  if (idx === -1) {
    throw new Error(`Column product_id not found in ${filePath}`)
  }

  const ids = new Set<string>()
  for (let r = 1; r < lines.length; r++) {
    const row = parseCsvLine(lines[r])
    const raw = row[idx]?.trim()
    if (!raw) continue
    if (!/^\d+$/.test(raw)) continue
    ids.add(raw)
  }
  return ids
}

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error("Missing DATABASE_URL. Set it in .env (same as Prisma).")
    process.exit(1)
  }

  const allIds = new Set<string>()
  for (const name of FILES) {
    const fp = path.join(DATA_DIR, name)
    if (!fs.existsSync(fp)) {
      console.warn("Skip (file not found):", fp)
      continue
    }
    const part = collectProductIdsFromCsv(fp)
    part.forEach((id) => allIds.add(id))
    console.log(`${name}: ${part.size} unique product_id values`)
  }

  if (allIds.size === 0) {
    console.error("No product_id values collected. Check CSV paths.")
    process.exit(1)
  }

  console.log(`Total unique product_id across CSVs: ${allIds.size}`)

  const prisma = new PrismaClient()
  const idList = [...allIds].map((s) => BigInt(s))

  const chunkSize = 500
  const found = new Set<string>()
  try {
    for (let i = 0; i < idList.length; i += chunkSize) {
      const chunk = idList.slice(i, i + chunkSize)
      const rows = await prisma.product.findMany({
        where: { id: { in: chunk } },
        select: { id: true },
      })
      rows.forEach((r) => found.add(r.id.toString()))
    }
  } finally {
    await prisma.$disconnect()
  }

  const missing = [...allIds].filter((id) => !found.has(id)).sort((a, b) => Number(a) - Number(b))

  if (missing.length === 0) {
    console.log("OK — every CSV product_id exists in the database (products table).")
    process.exit(0)
  }

  console.error(`FAIL — ${missing.length} product_id(s) from CSV are not in the database:`)
  console.error(missing.join(", "))
  process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
