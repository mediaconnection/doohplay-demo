// @ts-nocheck
/* =========================
   TYPES
========================= */

type Input = {
  trend: "improving" | "declining" | "stable"
  forecast: number[]
  comparison: {
    delta: number
  }
  alerts: string[]
}

/* =========================
   RISK SCORE
========================= */

export function calculateRiskScore(input: Input) {
  let score = 0

  const { trend, forecast, comparison, alerts } = input

  /* =========================
     TREND
  ========================= */

  if (trend === "declining") score += 30
  if (trend === "stable") score += 10

  /* =========================
     COMPARISON
  ========================= */

  if (comparison.delta < -10) score += 25
  else if (comparison.delta < -5) score += 15

  /* =========================
     FORECAST
  ========================= */

  if (forecast.length > 0) {
    const min = Math.min(...forecast)

    if (min < 50) score += 30
    else if (min < 70) score += 15
  }

  /* =========================
     ALERTS
  ========================= */

  score += alerts.length * 5

  /* =========================
     CLAMP
  ========================= */

  score = Math.min(100, score)

  /* =========================
     LABEL
  ========================= */

  let label = "LOW"

  if (score >= 70) label = "HIGH"
  else if (score >= 40) label = "MEDIUM"

  return {
    score,
    label,
  }
}
