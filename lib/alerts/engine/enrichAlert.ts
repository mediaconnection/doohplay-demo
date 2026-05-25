// @ts-nocheck
import type {
  AlertContext,
  AlertPolicy,
  TrustLabel
} from "../policies/types"

export type EnrichedAlert = {
  source_id: string | null
  trust_score: number | null
  trust_label: TrustLabel | null
  metadata: Record<string, unknown>
}

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null

  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

function safeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value

  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }

  return null
}

function normalizeTrustLabel(value: unknown): TrustLabel | null {
  if (value === "SAFE") return "SAFE"
  if (value === "WATCH") return "WATCH"
  if (value === "HIGH_RISK") return "HIGH_RISK"
  return null
}

export async function enrichAlert(params: {
  ctx: AlertContext
  policy: AlertPolicy
}): Promise<EnrichedAlert> {
  const { ctx, policy } = params

  const sourceId = safeString(ctx.input.sourceId)

  const metadata =
    ctx.input.metadata && typeof ctx.input.metadata === "object"
      ? ctx.input.metadata
      : {}

  const trustScore =
    ctx.trust?.score ??
    safeNumber(metadata.trust_score) ??
    null

  const trustLabel =
    ctx.trust?.label ??
    normalizeTrustLabel(metadata.trust_label)

  const policyMetadata =
    policy.enrich?.({
      ...ctx,
      trust: {
        score: trustScore ?? undefined,
        label: trustLabel ?? undefined
      }
    }) ?? {}

  return {
    source_id: sourceId,
    trust_score: trustScore,
    trust_label: trustLabel,
    metadata: {
      ...metadata,
      ...policyMetadata,
      policy: policy.type,
      policy_priority: policy.priority,
      policy_severity: policy.severity,
      alert_engine: "enterprise-v1",
      evaluated_at: ctx.now.toISOString()
    }
  }
}
