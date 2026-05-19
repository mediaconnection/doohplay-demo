/* =========================
   TYPES
========================= */

type AnomalyResult = {
  is_anomaly: boolean
  score: number
  deviation: number
}

/* =========================
   ANOMALY DETECTION
========================= */

export function detectAnomaly(values: number[]): AnomalyResult {
  if (values.length < 5) {
    return {
      is_anomaly: false,
      score: 0,
      deviation: 0,
    }
  }

  const mean =
    values.reduce((a, b) => a + b, 0) / values.length

  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
    values.length

  const stdDev = Math.sqrt(variance)

  const last = values[values.length - 1]

  if (stdDev === 0) {
    return {
      is_anomaly: false,
      score: 0,
      deviation: 0,
    }
  }

  const zScore = (last - mean) / stdDev

  const isAnomaly = Math.abs(zScore) > 2

  return {
    is_anomaly: isAnomaly,
    score: Math.round(Math.abs(zScore) * 10),
    deviation: Math.round(zScore * 100) / 100,
  }
}