export function buildVerificationCacheKey(hash: string): string {
  return `verify:${hash}`
}

export function buildProofCacheKey(input: unknown): string {
  if (typeof input === "string") return `proof:${input}`
  if (input && typeof input === "object" && "hash" in input) return `proof:${(input as Record<string, unknown>).hash}`
  return `proof:${String(input)}`
}
