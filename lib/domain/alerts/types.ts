// @ts-nocheck
export type AlertSeverity = "low" | "medium" | "high"

export type Alert = {
  type: string
  severity: AlertSeverity
  message: string
  metadata?: Record<string, any>
}
