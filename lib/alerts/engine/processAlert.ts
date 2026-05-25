// @ts-nocheck
import type { AlertInput, AlertContext } from "../policies/types"
import { evaluatePolicies } from "./evaluatePolicies"
import { enrichAlert } from "./enrichAlert"
import { computeRiskScore } from "./computeRiskScore"
import { persistAlert } from "./persistAlert"
import { auditAlert } from "./auditAlert"

export type ProcessAlertResult =
  | {
      ok: true
      alert_id: number | string
      type: string
      severity: string
      status: string
      risk_score: number
      trust_score: number | null
      source_id: string | null
      occurrences: number
      factors: string[]
      updated_at: string
    }
  | {
      ok: false
      reason: "INVALID_ALERT_TYPE" | "NO_POLICY_MATCH" | "ALERT_PROCESSING_FAILED"
      type?: string
      error?: string
    }

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

function normalizeInput(input: AlertInput): AlertInput | null {
  const type = safeString(input.type)

  if (!type) return null

  return {
    ...input,
    type,
    sourceId: safeString(input.sourceId) ?? undefined,
    metadata:
      input.metadata && typeof input.metadata === "object"
        ? input.metadata
        : undefined
  }
}

export async function processAlert(
  input: AlertInput
): Promise<ProcessAlertResult> {
  const normalizedInput = normalizeInput(input)

  if (!normalizedInput) {
    return {
      ok: false,
      reason: "INVALID_ALERT_TYPE"
    }
  }

  const ctx: AlertContext = {
    input: normalizedInput,
    now: new Date()
  }

  try {
    const evaluation = evaluatePolicies(ctx)

    if (!evaluation.matched) {
      return {
        ok: false,
        reason: evaluation.reason,
        type: normalizedInput.type
      }
    }

    const enriched = await enrichAlert({
      ctx,
      policy: evaluation.policy
    })

    const risk = computeRiskScore({
      ctx,
      policy: evaluation.policy,
      enriched
    })

    const alert = await persistAlert({
      ctx,
      policy: evaluation.policy,
      enriched,
      risk
    })

    try {
      await auditAlert({
        alert,
        ctx,
        enriched,
        risk
      })
    } catch (error) {
      console.warn("ALERT_AUDIT_NON_BLOCKING_FAILURE", error)
    }

    return {
      ok: true,
      alert_id: alert.id,
      type: alert.type,
      severity: alert.severity,
      status: alert.status,
      risk_score: risk.score,
      trust_score: enriched.trust_score,
      source_id: alert.source_id,
      occurrences: alert.occurrences,
      factors: risk.factors,
      updated_at: alert.last_seen_at
    }
  } catch (error) {
    console.error("ALERT_PROCESSING_FAILED", error)

    return {
      ok: false,
      reason: "ALERT_PROCESSING_FAILED",
      type: normalizedInput.type,
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR"
    }
  }
}
