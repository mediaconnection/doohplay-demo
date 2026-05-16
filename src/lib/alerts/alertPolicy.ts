import { processAlert } from "./engine/processAlert"
import type { AlertInput } from "./policies/types"
export { ALERT_POLICIES } from "./policies/index"

export type OpenOrUpdateAlertInput = {
  type: string
  severity?: string
  sourceId?: string
  metadata?: Record<string, unknown>
}

function safeString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function normalizeMetadata(
  metadata?: Record<string, unknown>,
  severity?: string
): Record<string, unknown> | undefined {
  const normalized: Record<string, unknown> = {
    ...(metadata ?? {})
  }

  const inputSeverity = safeString(severity)

  if (inputSeverity) {
    normalized.input_severity = inputSeverity
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined
}

function normalizeInput(input: OpenOrUpdateAlertInput): AlertInput {
  return {
    type: safeString(input.type) ?? "",
    sourceId: safeString(input.sourceId),
    metadata: normalizeMetadata(input.metadata, input.severity)
  }
}

export async function openOrUpdateAlert(input: OpenOrUpdateAlertInput) {
  return processAlert(normalizeInput(input))
}