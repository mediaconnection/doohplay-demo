import type {
  AlertContext,
  AlertPolicy,
  AlertSeverity,
  AlertStatus
} from "../policies/types"
import type { EnrichedAlert } from "./enrichAlert"

export type AlertRiskResult = {
  score: number
  severity: AlertSeverity
  status: AlertStatus
  factors: string[]
  policy_severity: AlertSeverity
}

const SEVERITY_FLOOR: Record<AlertSeverity, number> = {
  LOW: 20,
  MEDIUM: 40,
  HIGH: 70,
  CRITICAL: 90
}

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}

function normalizeSeverity(value: unknown): AlertSeverity {
  if (value === "CRITICAL") return "CRITICAL"
  if (value === "HIGH") return "HIGH"
  if (value === "MEDIUM") return "MEDIUM"
  return "LOW"
}

function severityFromScore(score: number): AlertSeverity {
  if (score >= 90) return "CRITICAL"
  if (score >= 70) return "HIGH"
  if (score >= 40) return "MEDIUM"
  return "LOW"
}

function maxSeverity(a: AlertSeverity, b: AlertSeverity): AlertSeverity {
  return SEVERITY_FLOOR[a] >= SEVERITY_FLOOR[b] ? a : b
}

function statusFromScore(score: number): AlertStatus {
  if (score >= 85) return "ESCALATED"
  return "OPEN"
}

function getOccurrenceBoost(occurrences: number): {
  boost: number
  factor: string | null
} {
  if (occurrences >= 10) {
    return { boost: 18, factor: "RECURRENCE_CRITICAL" }
  }

  if (occurrences >= 5) {
    return { boost: 12, factor: "RECURRENCE_HIGH" }
  }

  if (occurrences >= 2) {
    return { boost: 6, factor: "RECURRENCE_MEDIUM" }
  }

  if (occurrences >= 1) {
    return { boost: 3, factor: "RECURRENCE_LOW" }
  }

  return { boost: 0, factor: null }
}

function getTrustBoost(enriched: EnrichedAlert): {
  boost: number
  factors: string[]
} {
  const factors: string[] = []
  let boost = 0

  if (typeof enriched.trust_score === "number") {
    if (enriched.trust_score >= 90) {
      boost += 18
      factors.push("TRUST_GRAPH_CRITICAL")
    } else if (enriched.trust_score >= 80) {
      boost += 14
      factors.push("TRUST_GRAPH_HIGH_RISK")
    } else if (enriched.trust_score >= 50) {
      boost += 7
      factors.push("TRUST_GRAPH_WATCH")
    }
  }

  if (enriched.trust_label === "HIGH_RISK") {
    boost += 12
    factors.push("TRUST_LABEL_HIGH_RISK")
  } else if (enriched.trust_label === "WATCH") {
    boost += 6
    factors.push("TRUST_LABEL_WATCH")
  }

  return { boost, factors }
}

export function computeRiskScore(params: {
  ctx: AlertContext
  policy: AlertPolicy
  enriched: EnrichedAlert
}): AlertRiskResult {
  const { ctx, policy, enriched } = params

  const factors: string[] = []

  const policySeverity = normalizeSeverity(policy.severity)
  const policyFloor = SEVERITY_FLOOR[policySeverity]

  let score = Math.max(policy.risk.base, policyFloor)
  factors.push(`POLICY_${policy.type}`)
  factors.push(`POLICY_SEVERITY_${policySeverity}`)
  factors.push(`POLICY_BASE_${policy.risk.base}`)

  if (typeof policy.priority === "number") {
    factors.push(`POLICY_PRIORITY_${policy.priority}`)
  }

  if (policy.risk.multiplier && policy.risk.multiplier > 0) {
    score *= policy.risk.multiplier
    factors.push(`POLICY_MULTIPLIER_${policy.risk.multiplier}`)
  }

  const occurrences = ctx.history?.occurrences ?? 0
  const recurrence = getOccurrenceBoost(occurrences)

  if (recurrence.boost > 0) {
    score += recurrence.boost
  }

  if (recurrence.factor) {
    factors.push(recurrence.factor)
  }

  const trust = getTrustBoost(enriched)

  if (trust.boost > 0) {
    score += trust.boost
    factors.push(...trust.factors)
  }

  const finalScore = clamp(score)
  const scoreSeverity = severityFromScore(finalScore)
  const finalSeverity = maxSeverity(policySeverity, scoreSeverity)

  return {
    score: finalScore,
    severity: finalSeverity,
    status: statusFromScore(finalScore),
    factors,
    policy_severity: policySeverity
  }
}