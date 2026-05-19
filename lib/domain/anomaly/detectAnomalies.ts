type Input = {
  current_count: number
  baseline_avg: number
}

export type AnomalySeverity = "medium" | "high"

export type AnomalyAlert = {
  type: "ANOMALY_DROP" | "ANOMALY_SPIKE"
  severity: AnomalySeverity
  message: string
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

export function detectAnomalies(input: Input): AnomalyAlert[] {
  const alerts: AnomalyAlert[] = []

  if (input.baseline_avg <= 0) return alerts

  const ratio = input.current_count / input.baseline_avg

  if (ratio < 0.5) {
    alerts.push({
      type: "ANOMALY_DROP",
      severity: ratio < 0.3 ? "high" : "medium",
      message: `Volume dropped ${formatPercent((1 - ratio) * 100)}`
    })
  }

  if (ratio > 2) {
    alerts.push({
      type: "ANOMALY_SPIKE",
      severity: ratio > 3 ? "high" : "medium",
      message: `Volume increased ${formatPercent((ratio - 1) * 100)}`
    })
  }

  return alerts
}