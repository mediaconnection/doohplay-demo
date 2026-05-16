export function buildVerificationCacheKey(hash: string): string {
  return `verify:${hash}`
}

export function buildProofCacheKey(hash: string): string {
  return `proof:${hash}`
}
