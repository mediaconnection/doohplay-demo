type Input = {
  chain_valid: boolean
  merkle_valid: boolean
  merkle_consistent?: boolean
  block_valid: boolean
  signature_valid: boolean
  anchored?: boolean
  chain_depth: number
}

export function computeTrustScore(v: Input) {
  let score = 100
  const issues: string[] = []

  if (!v.chain_valid) {
    score -= 30
    issues.push("Broken chain")
  }

  if (!v.merkle_valid) {
    score -= 25
    issues.push("Invalid Merkle proof")
  }

  if (v.merkle_consistent === false) {
    score -= 15
    issues.push("Merkle inconsistency")
  }

  if (!v.block_valid) {
    score -= 10
    issues.push("Invalid block")
  }

  if (!v.signature_valid) {
    score -= 10
    issues.push("Invalid signature")
  }

  if (!v.anchored) {
    score -= 5
    issues.push("Not anchored on-chain")
  }

  // penaliza baixa profundidade
  if (v.chain_depth < 3) {
    score -= 5
    issues.push("Low chain depth")
  }

  score = Math.max(0, score)

  let label = "LOW"

  if (score < 50) label = "HIGH RISK"
  else if (score < 80) label = "MEDIUM"
  else label = "LOW"

  return {
    score,
    label,
    issues,
  }
}