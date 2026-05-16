import { processAlert } from "./engine/processAlert"
import type { AlertInput } from "./policies/types"

export type OpenOrUpdateAlertInput = {
  type: string
  severity?: string
  sourceId?: string
  metadata?: Record<string, unknown>
}

function normalizeInput(input: OpenOrUpdateAlertInput): AlertInput {
  return {
    type: input.type,
    sourceId: input.sourceId,
    metadata: input.metadata
  }
}

export async function openOrUpdateAlert(
  input: OpenOrUpdateAlertInput
) {
  return processAlert(normalizeInput(input))
}