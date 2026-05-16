export function buildVerificationCacheKey(hash: string): string {
  return `verify:${hash}`
}
