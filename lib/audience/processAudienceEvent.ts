import { pool } from "@/lib/db"
import { computeAudienceHash } from "./computeAudienceHash"

type AudienceDemographics = Record<string, unknown>

type AudienceEventInput = {
  screen_id: string
  campaign_id?: string | null
  faces: number
  attention: number
  dwell_time: number
  demographics?: AudienceDemographics | null
}

type AudienceEventRow = {
  id: string
}

function safeNumber(value: unknown): number {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function safeDemographics(value: unknown): AudienceDemographics {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {}
  }

  return value as AudienceDemographics
}

export async function processAudienceEvent(input: AudienceEventInput) {
  const screenId = safeString(input.screen_id)

  if (!screenId) {
    throw new Error("SCREEN_ID_REQUIRED")
  }

  const campaignId = safeString(input.campaign_id)
  const faces = safeNumber(input.faces)
  const attention = safeNumber(input.attention)
  const dwellTime = safeNumber(input.dwell_time)
  const demographics = safeDemographics(input.demographics)

  const timestamp = new Date().toISOString()

  const hash = computeAudienceHash({
    screen_id: screenId,
    campaign_id: campaignId ?? undefined,
    faces,
    attention,
    dwell_time: dwellTime,
    timestamp
  })

  const res = await pool.query(
    `
    INSERT INTO public.audience_events (
      screen_id,
      campaign_id,
      detected_faces,
      attention_score,
      avg_dwell_time,
      demographics,
      occurred_at,
      event_hash
    )
    VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)
    RETURNING id::text AS id
    `,
    [
      screenId,
      campaignId,
      faces,
      attention,
      dwellTime,
      JSON.stringify(demographics),
      timestamp,
      hash
    ]
  )

  const rows = res.rows as AudienceEventRow[]
  const audience_event_id = rows[0]?.id

  if (!audience_event_id) {
    throw new Error("AUDIENCE_EVENT_INSERT_FAILED")
  }

  return {
    audience_event_id,
    hash,
    event_hash: hash,
    occurred_at: timestamp,
    ledger: {
      skipped: true,
      reason:
        "insertEvent currently has a zero-argument signature in this project build. Audience event was persisted in audience_events."
    }
  }
}