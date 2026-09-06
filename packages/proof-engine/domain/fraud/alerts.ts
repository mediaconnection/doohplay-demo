// @ts-nocheck
/* =========================
   TYPES
========================= */

export type ClientRiskInput = {
  id: number | string
  name?: string

  trust_score: number
  total_events: number

  last_event?: string | null

  // opcionais (futuro)
  chain_depth_avg?: number
  invalid_rate?: number
  anomaly_count?: number
}

export type Alert = {
  type: string
  severity: "low" | "medium" | "high"
  message: string
}

/* =========================
   CONFIG (REGRAS)
========================= */

const RULES = {
  HIGH_RISK_THRESHOLD: 50,
  MEDIUM_RISK_THRESHOLD: 80,

  HIGH_VOLUME_THRESHOLD: 10000,
  LOW_TRUST_VOLUME_THRESHOLD: 70,

  INACTIVITY_HOURS: 24 * 7, // 7 dias

  MAX_ANOMALY_THRESHOLD: 5,
}

/* =========================
   HELPERS
========================= */

function hoursSince(date?: string | null): number | null {
  if (!date) return null

  const diff = Date.now() - new Date(date).getTime()
  return diff / (1000 * 60 * 60)
}

/* =========================
   ALERT ENGINE
========================= */

export function generateAlerts(client: ClientRiskInput): Alert[] {
  const alerts: Alert[] = []

  const {
    trust_score,
    total_events,
    last_event,
    anomaly_count,
    invalid_rate,
  } = client

  /* =========================
     1. TRUST SCORE
  ========================= */

  if (trust_score < RULES.HIGH_RISK_THRESHOLD) {
    alerts.push({
      type: "TRUST_LOW",
      severity: "high",
      message: "Very low trust score detected",
    })
  } else if (trust_score < RULES.MEDIUM_RISK_THRESHOLD) {
    alerts.push({
      type: "TRUST_MEDIUM",
      severity: "medium",
      message: "Moderate trust score",
    })
  }

  /* =========================
     2. HIGH VOLUME + LOW TRUST
  ========================= */

  if (
    total_events > RULES.HIGH_VOLUME_THRESHOLD &&
    trust_score < RULES.LOW_TRUST_VOLUME_THRESHOLD
  ) {
    alerts.push({
      type: "HIGH_VOLUME_LOW_TRUST",
      severity: "high",
      message: "High event volume with low trust score",
    })
  }

  /* =========================
     3. INACTIVITY
  ========================= */

  const hours = hoursSince(last_event)

  if (hours && hours > RULES.INACTIVITY_HOURS) {
    alerts.push({
      type: "INACTIVE",
      severity: "low",
      message: "Client inactive for long period",
    })
  }

  /* =========================
     4. ANOMALIES
  ========================= */

  if (typeof anomaly_count === "number") {
    if (anomaly_count >= RULES.MAX_ANOMALY_THRESHOLD) {
      alerts.push({
        type: "ANOMALY_SPIKE",
        severity: "high",
        message: "High number of anomalies detected",
      })
    }
  }

  /* =========================
     5. INVALID RATE
  ========================= */

  if (typeof invalid_rate === "number") {
    if (invalid_rate > 0.2) {
      alerts.push({
        type: "HIGH_INVALID_RATE",
        severity: "high",
        message: "High rate of invalid events",
      })
    } else if (invalid_rate > 0.1) {
      alerts.push({
        type: "MEDIUM_INVALID_RATE",
        severity: "medium",
        message: "Moderate invalid event rate",
      })
    }
  }

  return alerts
}

/* =========================
   SUMMARY (OPCIONAL)
========================= */

export function summarizeAlerts(alerts: Alert[]) {
  if (!alerts.length) {
    return {
      level: "LOW",
      count: 0,
    }
  }

  let level: "LOW" | "MEDIUM" | "HIGH" = "LOW"

  if (alerts.some(a => a.severity === "high")) {
    level = "HIGH"
  } else if (alerts.some(a => a.severity === "medium")) {
    level = "MEDIUM"
  }

  return {
    level,
    count: alerts.length,
  }
}
