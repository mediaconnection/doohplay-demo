import type {
  AlertPolicy,
  AlertPolicySeverity
} from "./evaluatePolicies"

export type AlertInput = {
  type: string
  sourceId?: string
  metadata?: Record<string, unknown>
}

export type EnrichedAlertData = {
  trust_score?: number | null
  risk?: string | null
  previous_alerts?: number | null
  source_status?: string | null
  [key: string]: unknown
}

export type ComputeRiskScoreInput = {
  input: AlertInput
  now: Date
  policy: AlertPolicy
  enriched?: EnrichedAlertData | null
}

export type AlertRiskSeverity = AlertPolicySeverity

export type AlertRiskScore = {
  score: number
  severity: AlertRiskSeverity
  reasons: string[]
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function severityBaseScore(severity: AlertPolicySeverity): number {
  if (severity === "CRITICAL") return 90
  if (severity === "HIGH") return 75
  if (severity === "MEDIUM") return 50

  return 25
}

function severityFromScore(score: number): AlertRiskSeverity {
  if (score >= 90) return "CRITICAL"
  if (score >= 70) return "HIGH"
  if (score >= 40) return "MEDIUM"

  return "LOW"
}

function safeNumber(value: unknown): number | null {
  const numeric = Number(value)

  return Number.isFinite(numeric) ? numeric : null
}

export function computeRiskScore(
  input: ComputeRiskScoreInput
): AlertRiskScore {
  const reasons: string[] = []

  let score = severityBaseScore(input.policy.severity)

  reasons.push(`POLICY_${input.policy.severity}`)

  const trustScore = safeNumber(input.enriched?.trust_score)

  if (trustScore !== null) {
    if (trustScore < 40) {
      score += 20
      reasons.push("LOW_TRUST_SCORE")
    } else if (trustScore < 70) {
      score += 10
      reasons.push("MEDIUM_TRUST_SCORE")
    } else {
      score -= 5
      reasons.push("HIGH_TRUST_SCORE")
    }
  }

  const previousAlerts = safeNumber(input.enriched?.previous_alerts)

  if (previousAlerts !== null && previousAlerts >= 3) {
    score += 10
    reasons.push("REPEATED_ALERT_SOURCE")
  }

  if (input.enriched?.risk === "HIGH_RISK") {
    score += 15
    reasons.push("HIGH_RISK_SOURCE")
  }

  if (input.enriched?.source_status === "offline") {
    score += 10
    reasons.push("SOURCE_OFFLINE")
  }

  const finalScore = clampScore(score)

  return {
    score: finalScore,
    severity: severityFromScore(finalScore),
    reasons
  }
}