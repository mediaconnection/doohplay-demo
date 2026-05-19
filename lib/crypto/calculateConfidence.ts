export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW"

export type ConfidenceInput = {
  event_exists: boolean
  event_hash_valid: boolean
  merkle_valid: boolean

  certificate_exists: boolean
  certificate_hash_valid: boolean
  signature_valid: boolean

  chain_valid: boolean
  chain_depth: number
  chain_errors: number

  anchored?: boolean
}

export type ConfidenceResult = {
  score: number
  level: ConfidenceLevel
  reasons: string[]
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)))
}

export function calculateConfidence(input: ConfidenceInput): ConfidenceResult {
  let score = 0
  const reasons: string[] = []

  if (input.event_exists) {
    score += 10
    reasons.push("event_exists")
  }

  if (input.event_hash_valid) {
    score += 20
    reasons.push("hash_valid")
  }

  if (input.merkle_valid) {
    score += 15
    reasons.push("merkle_valid")
  }

  if (input.certificate_exists) {
    score += 10
    reasons.push("certificate_exists")
  }

  if (input.certificate_hash_valid) {
    score += 10
    reasons.push("certificate_hash_valid")
  }

  if (input.signature_valid) {
    score += 20
    reasons.push("signature_valid")
  }

  if (input.chain_valid) {
    score += 10
    reasons.push("chain_valid")
  }

  if (input.chain_depth > 3) {
    score += 5
    reasons.push("deep_chain")
  }

  if (input.chain_errors > 0) {
    score -= 20
    reasons.push("chain_errors")
  }

  if (input.anchored) {
    score += 20
    reasons.push("blockchain_anchor")
  }

  const finalScore = clampScore(score)

  const level: ConfidenceLevel =
    finalScore >= 80 ? "HIGH" : finalScore >= 50 ? "MEDIUM" : "LOW"

  return {
    score: finalScore,
    level,
    reasons
  }
}