// @ts-nocheck
type Input = {
  hashes: string[]
}

export type HashDuplicationSeverity = "medium" | "high"

export type HashDuplicationAlert = {
  type: "HASH_DUPLICATION"
  severity: HashDuplicationSeverity
  message: string
}

export function detectHashDuplication(input: Input): HashDuplicationAlert[] {
  const alerts: HashDuplicationAlert[] = []

  if (!input.hashes.length) return alerts

  const map = new Map<string, number>()

  for (const hash of input.hashes) {
    map.set(hash, (map.get(hash) ?? 0) + 1)
  }

  let duplicated = 0

  for (const count of map.values()) {
    if (count > 1) {
      duplicated += count
    }
  }

  const ratio = duplicated / input.hashes.length

  if (ratio > 0.05) {
    alerts.push({
      type: "HASH_DUPLICATION",
      severity: ratio > 0.1 ? "high" : "medium",
      message: `${(ratio * 100).toFixed(2)}% duplicated hashes`
    })
  }

  return alerts
}
