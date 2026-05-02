import rulesData from "./association_rules.json"

export type ExportedAssociationRule = {
  antecedent: string
  consequents: string[]
  lift: number
  confidence: number
  support: number
}

type RulesFile = {
  rules: ExportedAssociationRule[]
  ruleCount: number
  orderCount: number
}

const data = rulesData as RulesFile

/** Normalize product ids so CSV strings match Prisma BigInt string form. */
export function normalizeProductId(id: string): string {
  try {
    return BigInt(id.trim()).toString()
  } catch {
    return id.trim()
  }
}

/**
 * Consequent product ids for association rules where `antecedent === currentProductId`,
 * ordered by lift (rules are pre-sorted in export; we re-sort for safety).
 */
export function getAprioriRecommendationIds(currentProductId: string, limit = 4): string[] {
  const key = normalizeProductId(currentProductId)
  const rows = data.rules.filter((r) => r.antecedent === key)
  if (rows.length === 0) return []

  const sorted = [...rows].sort((a, b) => b.lift - a.lift)
  const seen = new Set<string>()
  const out: string[] = []

  for (const r of sorted) {
    for (const c of r.consequents) {
      const cid = normalizeProductId(c)
      if (cid === key || seen.has(cid)) continue
      seen.add(cid)
      out.push(cid)
      if (out.length >= limit) return out
    }
  }

  return out
}
