export type ProofCacheKeyInput = {
  hash: string
  entity_id: string
  entity_type: string
}

function safePart(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
}

export function buildProofCacheKey(input: ProofCacheKeyInput): string {
  return `proof:${safePart(input.entity_type)}:${safePart(
    input.entity_id
  )}:${safePart(input.hash)}`
}