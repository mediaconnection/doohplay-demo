export type VerificationLayer = {
  valid: boolean
  weight?: number | null
  reasons?: string[] | null
}

export type DecisionResult = {
  status: "VERIFIED" | "WARNING" | "FAILED"
  trust_level: "HIGH" | "MEDIUM" | "LOW"
  risk_level: "LOW" | "MEDIUM" | "HIGH"
  score: number
  reasons: string[]
}

function safeWeight(value: unknown): number {
  const weight = Number(value)
  return Number.isFinite(weight) ? weight : 0
}

export function computeDecision(layers: VerificationLayer[]): DecisionResult {
  let score = 0
  const reasons: string[] = []

  for (const layer of layers) {
    const weight = safeWeight(layer.weight)

    if (layer.valid === true) {
      score += weight
    } else {
      reasons.push(...(layer.reasons ?? []))
      score -= weight * 0.5
    }
  }

  score = Math.max(0, Math.min(100, score))

  if (score >= 80) {
    return {
      status: "VERIFIED",
      trust_level: "HIGH",
      risk_level: "LOW",
      score,
      reasons
    }
  }

  if (score >= 50) {
    return {
      status: "WARNING",
      trust_level: "MEDIUM",
      risk_level: "MEDIUM",
      score,
      reasons
    }
  }

  return {
    status: "FAILED",
    trust_level: "LOW",
    risk_level: "HIGH",
    score,
    reasons
  }
}