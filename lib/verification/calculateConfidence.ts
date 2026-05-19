type Input = {
  event_exists: boolean
  event_hash_valid: boolean
  merkle_valid: boolean

  certificate_exists: boolean
  certificate_hash_valid: boolean
  signature_valid: boolean

  chain_valid: boolean
  chain_depth: number
  chain_errors: number

  anchored: boolean
}

type Output = {
  score: number
  level: "HIGH" | "MEDIUM" | "LOW"
  reasons: string[]
}

/* =========================
   🎯 WEIGHTS (AJUSTÁVEL)
========================= */

const WEIGHTS = {
  event_exists: 10,
  hash_valid: 20,
  merkle_valid: 15,

  certificate: 10,
  cert_hash: 10,
  signature: 15,

  chain: 10,
  chain_depth_bonus: 5,
  chain_penalty: -15,

  anchored: 5
}

/* =========================
   ENGINE
========================= */

export function calculateConfidence(input: Input): Output {
  let score = 0
  const reasons: string[] = []

  /* EVENT */
  if (input.event_exists) score += WEIGHTS.event_exists
  else reasons.push("EVENT_NOT_FOUND")

  if (input.event_hash_valid) score += WEIGHTS.hash_valid
  else reasons.push("INVALID_HASH")

  if (input.merkle_valid) score += WEIGHTS.merkle_valid
  else reasons.push("INVALID_MERKLE")

  /* CERT */
  if (input.certificate_exists) {
    score += WEIGHTS.certificate

    if (input.certificate_hash_valid) score += WEIGHTS.cert_hash
    else reasons.push("CERT_HASH_INVALID")

    if (input.signature_valid) score += WEIGHTS.signature
    else reasons.push("SIGNATURE_INVALID")

    if (input.chain_valid) {
      score += WEIGHTS.chain

      if (input.chain_depth >= 2) {
        score += WEIGHTS.chain_depth_bonus
      }
    } else {
      score += WEIGHTS.chain_penalty
      reasons.push("CHAIN_INVALID")
    }

    if (input.chain_errors > 0) {
      score -= input.chain_errors * 2
      reasons.push("CHAIN_ERRORS")
    }
  }

  /* BLOCKCHAIN */
  if (input.anchored) {
    score += WEIGHTS.anchored
  } else {
    reasons.push("NOT_ANCHORED")
  }

  /* NORMALIZAÇÃO */
  score = Math.max(0, Math.min(100, score))

  /* LEVEL */
  let level: Output["level"] = "LOW"

  if (score >= 80) level = "HIGH"
  else if (score >= 50) level = "MEDIUM"

  return {
    score,
    level,
    reasons
  }
}