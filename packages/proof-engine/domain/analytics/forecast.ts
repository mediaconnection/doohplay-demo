// @ts-nocheck
/* =========================
   FORECAST (LINEAR)
========================= */

export function forecastLinear(values: number[], days = 7) {
  if (values.length < 2) {
    return []
  }

  const n = values.length

  const x = Array.from({ length: n }, (_, i) => i)
  const y = values

  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)

  const slope =
    (n * sumXY - sumX * sumY) /
    (n * sumXX - sumX * sumX)

  const intercept = (sumY - slope * sumX) / n

  const forecast = []

  for (let i = 0; i < days; i++) {
    const xi = n + i
    const yi = slope * xi + intercept

    forecast.push(Math.max(0, Math.min(100, Math.round(yi))))
  }

  return forecast
}
