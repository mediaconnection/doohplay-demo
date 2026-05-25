// @ts-nocheck
/* =========================
   TREND DETECTION
========================= */

export type Trend = "improving" | "declining" | "stable"

export function detectTrend(values: number[]): Trend {
  if (!Array.isArray(values) || values.length < 2) {
    return "stable"
  }

  const first = values[0]
  const last = values[values.length - 1]

  if (typeof first !== "number" || typeof last !== "number") {
    return "stable"
  }

  const diff = last - first

  if (diff > 10) return "improving"
  if (diff < -10) return "declining"

  return "stable"
}
