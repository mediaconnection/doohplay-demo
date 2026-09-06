// @ts-nocheck
/* =========================
   PREDICTIVE ALERTS
========================= */

type Input = {
  trend: "improving" | "declining" | "stable"
  currentValues: number[]
  forecast: number[]
}

export function generatePredictiveAlerts(input: Input) {
  const alerts: string[] = []

  const { trend, currentValues, forecast } = input

  const last = currentValues[currentValues.length - 1]

  /* =========================
     1. TREND ALERT
  ========================= */

  if (trend === "declining") {
    alerts.push("Trust is declining")
  }

  /* =========================
     2. SHARP DROP
  ========================= */

  if (currentValues.length >= 3) {
    const recent = currentValues.slice(-3)

    const drop = recent[0] - recent[2]

    if (drop > 10) {
      alerts.push("Sharp drop detected")
    }
  }

  /* =========================
     3. FORECAST ALERT
  ========================= */

  if (forecast.length > 0) {
    const minForecast = Math.min(...forecast)

    if (minForecast < 50) {
      alerts.push("Forecast indicates high risk (<50)")
    } else if (minForecast < 70) {
      alerts.push("Forecast trending to medium risk")
    }
  }

  /* =========================
     4. COLLAPSE WARNING
  ========================= */

  if (forecast.length >= 3) {
    const futureDrop = forecast[0] - forecast[forecast.length - 1]

    if (futureDrop > 15) {
      alerts.push("Projected rapid decline")
    }
  }

  return alerts
}
