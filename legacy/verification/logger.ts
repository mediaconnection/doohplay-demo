type LogLevel = "warn" | "error"
type LogContext = Record<string, unknown>

function log(level: LogLevel, event: string, context: LogContext = {}) {
  const payload = {
    event,
    ...context,
    timestamp: new Date().toISOString()
  }

  if (level === "warn") {
    console.warn(payload)
    return
  }

  console.error(payload)
}

export function logWarn(event: string, context: LogContext = {}) {
  log("warn", event, context)
}

export function logError(event: string, context: LogContext = {}) {
  log("error", event, context)
}