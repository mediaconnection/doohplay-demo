/* =========================
   TYPES
========================= */

type ScoreInput = {
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
  revoked?: boolean
}

type ScoreFactor = {
  name: string
  impact: number
}

type ScoreResult = {
  score: number
  level: "HIGH" | "MEDIUM" | "LOW"
  risk: "LOW" | "MEDIUM" | "HIGH"
  factors: ScoreFactor[]
  reasons: string[]
}

/* =========================
   ENGINE
========================= */

export function calculateTrustScore(input: ScoreInput): ScoreResult {

  let score = 0
  const factors: ScoreFactor[] = []
  const reasons: string[] = []

  function add(name: string, impact: number, reason?: string) {
    score += impact
    factors.push({ name, impact })
    if (reason) reasons.push(reason)
  }

  /* =========================
     EVENT
  ========================= */

  if (input.event_exists) add("EVENT_EXISTS", 20)
  else add("EVENT_MISSING", -50, "EVENT_NOT_FOUND")

  if (input.event_hash_valid) add("HASH_VALID", 20)
  else add("HASH_INVALID", -40, "HASH_INVALID")

  if (input.merkle_valid) add("MERKLE_VALID", 15)
  else add("MERKLE_INVALID", -30, "MERKLE_INVALID")

  /* =========================
     CERTIFICATE
  ========================= */

  if (input.certificate_exists) {

    if (input.certificate_hash_valid)
      add("CERT_HASH_VALID", 15)
    else
      add("CERT_HASH_INVALID", -30, "CERT_HASH_INVALID")

    if (input.signature_valid)
      add("SIGNATURE_VALID", 25)
    else
      add("SIGNATURE_INVALID", -50, "SIGNATURE_INVALID")

    if (input.chain_valid)
      add("CHAIN_VALID", 20)
    else
      add("CHAIN_INVALID", -40, "CHAIN_INVALID")

    if (input.chain_depth < 2)
      add("CHAIN_WEAK", -10, "CHAIN_DEPTH_LOW")

    if (input.chain_errors > 0)
      add("CHAIN_ERRORS", -10, "CHAIN_ERRORS")

    if (input.revoked)
      add("CERT_REVOKED", -80, "CERT_REVOKED")

  } else {
    add("NO_CERTIFICATE", -10, "NO_CERTIFICATE")
  }

  /* =========================
     BLOCKCHAIN
  ========================= */

  if (input.anchored)
    add("BLOCKCHAIN_ANCHORED", 15)
  else
    add("NOT_ANCHORED", -20, "NOT_ANCHORED")

  /* =========================
     NORMALIZE SCORE
  ========================= */

  score = Math.max(0, Math.min(100, score))

  /* =========================
     LEVEL
  ========================= */

  let level: "HIGH" | "MEDIUM" | "LOW" = "LOW"

  if (score >= 80) level = "HIGH"
  else if (score >= 50) level = "MEDIUM"

  /* =========================
     RISK
  ========================= */

  const risk =
    level === "HIGH"
      ? "LOW"
      : level === "MEDIUM"
      ? "MEDIUM"
      : "HIGH"

  return {
    score,
    level,
    risk,
    factors,
    reasons: Array.from(new Set(reasons))
  }
}