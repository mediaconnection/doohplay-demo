/* =========================
   ALERT POLICY TYPES
========================= */

export type AlertSeverity =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL"

export type AlertContext = {
  input: {
    type: string
    sourceId?: string
    metadata?: Record<string, unknown>
  }

  now: Date

  /* opcional (preparado para enterprise) */
  trust?: {
    score?: number
    label?: "SAFE" | "WATCH" | "HIGH_RISK"
  }

  history?: {
    occurrences?: number
    last_seen_at?: string
  }
}

/* =========================
   POLICY DEFINITION
========================= */

export type AlertPolicy = {
  type: string

  severity: AlertSeverity

  /**
   * Define se a policy deve ser aplicada
   */
  condition: (ctx: AlertContext) => boolean

  /**
   * Base de risco
   */
  risk: {
    base: number
    multiplier?: number
  }

  /**
   * Enriquecimento (Trust Graph, metadata, etc)
   */
  enrich?: (ctx: AlertContext) => Record<string, unknown>
}