import { Alert } from "./types"

type Input = {
  trust_average: number
  anchored_rate: number
  verification_rate: number
  total_events: number
}

export function detectAlerts(input: Input): Alert[] {
  const alerts: Alert[] = []

  /* =========================
     TRUST SCORE
  ========================= */

  if (input.trust_average < 80) {
    alerts.push({
      type: "LOW_TRUST_SCORE",
      severity: input.trust_average < 60 ? "high" : "medium",
      message: `Trust score is ${input.trust_average}`
    })
  }

  /* =========================
     ANCHOR RATE
  ========================= */

  if (input.anchored_rate < 0.7) {
    alerts.push({
      type: "LOW_ANCHOR_RATE",
      severity: input.anchored_rate < 0.5 ? "high" : "medium",
      message: `Only ${(input.anchored_rate * 100).toFixed(1)}% anchored`
    })
  }

  /* =========================
     VERIFICATION RATE
  ========================= */

  if (input.verification_rate < 0.8) {
    alerts.push({
      type: "LOW_VERIFICATION_RATE",
      severity: input.verification_rate < 0.6 ? "high" : "medium",
      message: `Verification rate ${(input.verification_rate * 100).toFixed(1)}%`
    })
  }

  /* =========================
     LOW VOLUME (anomalia)
  ========================= */

  if (input.total_events < 100) {
    alerts.push({
      type: "LOW_VOLUME",
      severity: "low",
      message: "Very low event volume"
    })
  }

  return alerts
}