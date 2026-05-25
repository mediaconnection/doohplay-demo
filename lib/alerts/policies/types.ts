// @ts-nocheck
export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
export type AlertStatus = "OPEN" | "ESCALATED" | "RESOLVED"
export type TrustLabel = "SAFE" | "WATCH" | "HIGH_RISK"

export type AlertInput = {
  type: string
  severity?: string
  sourceId?: string
  metadata?: Record<string, unknown>
}

export type AlertContext = {
  input: AlertInput
  now: Date
  history?: {
    occurrences?: number
    last_seen_at?: string | null
  }
  trust?: {
    score?: number
    label?: TrustLabel
  }
}

export type AlertPolicy = {
  type: string
  severity: AlertSeverity
  priority: number
  threshold_seconds?: number
  condition: (ctx: AlertContext) => boolean
  risk: {
    base: number
    multiplier?: number
  }
  enrich?: (ctx: AlertContext) => Record<string, unknown>
}
