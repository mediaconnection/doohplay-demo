// @ts-nocheck
type TrustInput = {
  chain_valid: boolean
  merkle_valid: boolean
  block_valid: boolean
  signature_valid: boolean
  anchored: boolean
}

export function calculateTrustScore(input: TrustInput) {
  let score = 0

  if (input.chain_valid) score += 25
  if (input.merkle_valid) score += 25
  if (input.block_valid) score += 20
  if (input.signature_valid) score += 10
  if (input.anchored) score += 20

  return score
}

export function getTrustLabel(score: number) {
  if (score === 100) return "TRUSTED"
  if (score >= 80) return "HIGH"
  if (score >= 60) return "MEDIUM"
  return "LOW"
}
