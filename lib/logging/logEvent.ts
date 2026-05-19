import { pool } from "@/lib/db"

/* =========================
   TYPES
========================= */

export type LogEventLevel = "INFO" | "WARN" | "ERROR" | "DEBUG"

export type LogEventInput = {
  type: string
  level?: LogEventLevel
  message?: string
  metadata?: Record<string, unknown> | null
  entity_id?: string | null
  entity_type?: string | null
  source?: string | null
}

/* =========================
   HELPERS
========================= */

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value ?? {})
  } catch {
    return "{}"
  }
}

function nowIso(): string {
  return new Date().toISOString()
}

/* =========================
   MAIN LOGGER
========================= */

export async function logEvent(input: LogEventInput) {
  const {
    type,
    level = "INFO",
    message = "",
    metadata = null,
    entity_id = null,
    entity_type = null,
    source = null
  } = input

  const timestamp = nowIso()

  /* =========================
     CONSOLE (ALWAYS)
  ========================= */

  const logPayload = {
    ts: timestamp,
    level,
    type,
    message,
    entity_id,
    entity_type,
    source,
    metadata
  }

  if (level === "ERROR") {
    console.error("LOG_EVENT", logPayload)
  } else if (level === "WARN") {
    console.warn("LOG_EVENT", logPayload)
  } else {
    console.log("LOG_EVENT", logPayload)
  }

  /* =========================
     DB (OPTIONAL)
  ========================= */

  try {
    await pool.query(
      `
      insert into public.event_logs (
        event_type,
        level,
        message,
        metadata,
        entity_id,
        entity_type,
        source,
        created_at
      )
      values ($1,$2,$3,$4::jsonb,$5,$6,$7,$8)
      `,
      [
        type,
        level,
        message,
        safeJson(metadata),
        entity_id,
        entity_type,
        source,
        timestamp
      ]
    )
  } catch (err) {
    // NÃO quebra o sistema por causa de log
    console.warn("LOG_EVENT_DB_FAIL", {
      error: err instanceof Error ? err.message : String(err)
    })
  }

  return {
    ok: true,
    timestamp
  }
}

/* =========================
   SHORTCUTS
========================= */

export const logInfo = (type: string, message?: string, metadata?: any) =>
  logEvent({ type, level: "INFO", message, metadata })

export const logWarn = (type: string, message?: string, metadata?: any) =>
  logEvent({ type, level: "WARN", message, metadata })

export const logError = (type: string, message?: string, metadata?: any) =>
  logEvent({ type, level: "ERROR", message, metadata })

export const logDebug = (type: string, metadata?: any) =>
  logEvent({ type, level: "DEBUG", metadata })