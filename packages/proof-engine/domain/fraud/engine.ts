// @ts-nocheck
/* =========================
   TYPES
========================= */

type FraudInput = {
  trend: string
  forecast: number[]
  risk: { score: number; label: string } | null
  anomaly?: {
    is_anomaly: boolean
    score: number
  }
  alerts: string[]
  confidence: number
}

type FraudResult = {
  isFraud: boolean
  score: number
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  reasons: string[]
}

/* =========================
   ENGINE
========================= */

export function detectFraud(input: FraudInput): FraudResult {
  let score = 0
  const reasons: string[] = []

  /* =========================
     TREND
  ========================= */

  if (input.trend === "declining") {
    score += 20
    reasons.push("Declining trend")
  }

  /* =========================
     FORECAST
  ========================= */

  if (input.forecast.length >= 2) {
    const first = input.forecast[0]
    const last = input.forecast[input.forecast.length - 1]

    if (last < first - 10) {
      score += 25
      reasons.push("Projected drop")
    }
  }

  /* =========================
     RISK
  ========================= */

  if (input.risk) {
    score += input.risk.score * 0.4

    if (input.risk.score > 80) {
      reasons.push("High risk score")
    }
  }

  /* =========================
     ANOMALY
  ========================= */

  if (input.anomaly?.is_anomaly) {
    score += 30
    reasons.push("Anomalous behavior")
  }

  /* =========================
     ALERTS
  ========================= */

  score += input.alerts.length * 5

  if (input.alerts.length > 0) {
    reasons.push("Multiple alerts triggered")
  }

  /* =========================
     CONFIDENCE
  ========================= */

  score = score * (input.confidence / 100)

  /* =========================
     LEVEL
  ========================= */

  let level: FraudResult["level"] = "LOW"

  if (score > 80) level = "CRITICAL"
  else if (score > 60) level = "HIGH"
  else if (score > 40) level = "MEDIUM"

  return {
    isFraud: score > 60,
    score: Math.round(score),
    level,
    reasons,
  }
}
