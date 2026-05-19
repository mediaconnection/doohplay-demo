import crypto from "crypto"
import { pool } from "@/lib/db"
import { appendEventToLedger } from "@/lib/domain/ledger/appendEvent"

export type RegisterImpressionInput = {
  screenId: string
  campaignId: string
  creativeId: string
  playerId?: string | null
  deviceId?: string | null
  playedAt?: string | Date | null
  metadata?: Record<string, unknown> | null
}

export type RegisterImpressionResult = {
  id?: string | number
  screen_id: string
  campaign_id: string
  creative_id: string
  player_id?: string | null
  device_id?: string | null
  played_at?: string | Date
  metadata?: Record<string, unknown> | null
  event_hash?: string | null
  [key: string]: unknown
}

function safeString(value: unknown): string {
  if (typeof value !== "string") return ""
  return value.trim()
}

function normalizeDate(value: unknown): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value
  }

  if (typeof value === "string" && value.trim()) {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return date
  }

  return new Date()
}

function normalizeMetadata(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }

  return value as Record<string, unknown>
}

function resolveInput(
  inputOrScreenId: RegisterImpressionInput | string,
  campaignId?: string,
  creativeId?: string
): RegisterImpressionInput {
  if (typeof inputOrScreenId === "string") {
    return {
      screenId: inputOrScreenId,
      campaignId: campaignId ?? "",
      creativeId: creativeId ?? ""
    }
  }

  return inputOrScreenId
}

export async function registerImpression(
  inputOrScreenId: RegisterImpressionInput | string,
  campaignId?: string,
  creativeId?: string
): Promise<RegisterImpressionResult> {
  const input = resolveInput(inputOrScreenId, campaignId, creativeId)

  const screenId = safeString(input.screenId)
  const resolvedCampaignId = safeString(input.campaignId)
  const resolvedCreativeId = safeString(input.creativeId)
  const playerId = safeString(input.playerId) || null
  const deviceId = safeString(input.deviceId) || null
  const playedAt = normalizeDate(input.playedAt)
  const metadata = normalizeMetadata(input.metadata)

  if (!screenId) throw new Error("SCREEN_ID_REQUIRED")
  if (!resolvedCampaignId) throw new Error("CAMPAIGN_ID_REQUIRED")
  if (!resolvedCreativeId) throw new Error("CREATIVE_ID_REQUIRED")

  const result = await pool.query(
    `
    insert into public.impressions (
      screen_id,
      campaign_id,
      creative_id,
      player_id,
      device_id,
      played_at,
      metadata
    )
    values ($1, $2, $3, $4, $5, $6, $7::jsonb)
    returning *
    `,
    [
      screenId,
      resolvedCampaignId,
      resolvedCreativeId,
      playerId,
      deviceId,
      playedAt,
      metadata ? JSON.stringify(metadata) : null
    ]
  )

  const row = result.rows[0] as RegisterImpressionResult | undefined

  if (!row) throw new Error("IMPRESSION_INSERT_FAILED")

  // Append to the immutable ledger so this impression enters the proof pipeline.
  // Non-blocking: a ledger failure never prevents the impression from being saved.
  const ledgerPayload = {
    event_type: "impression",
    impression_id: String(row.id),
    screen_id: screenId,
    campaign_id: resolvedCampaignId,
    creative_id: resolvedCreativeId,
    player_id: playerId,
    device_id: deviceId,
    played_at: playedAt.toISOString(),
  }

  const payloadHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(ledgerPayload))
    .digest("hex")

  try {
    const ledgerRow = await appendEventToLedger({
      event_id: crypto.randomUUID(),
      hash: payloadHash,
      payload: ledgerPayload,
    })

    row.event_hash = ledgerRow?.event_hash ?? null
  } catch (err) {
    console.error("[registerImpression] ledger append failed:", (err as Error).message)
    row.event_hash = null
  }

  return row
}

export default registerImpression
