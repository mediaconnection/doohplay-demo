import { pool } from "@/lib/db"

export type RegisterImpressionInput = {
  screenId: string
  campaignId: string
  creativeId: string
  playedAt?: string | Date | null
}

function safeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
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
) {
  const input = resolveInput(inputOrScreenId, campaignId, creativeId)

  const screenId = safeString(input.screenId)
  const resolvedCampaignId = safeString(input.campaignId)
  const resolvedCreativeId = safeString(input.creativeId)

  if (!screenId) throw new Error("SCREEN_ID_REQUIRED")
  if (!resolvedCampaignId) throw new Error("CAMPAIGN_ID_REQUIRED")
  if (!resolvedCreativeId) throw new Error("CREATIVE_ID_REQUIRED")

  const playedAt =
    input.playedAt instanceof Date
      ? input.playedAt
      : typeof input.playedAt === "string" && input.playedAt.trim()
        ? new Date(input.playedAt)
        : new Date()

  const { rows } = await pool.query(
    `
    insert into public.impressions (
      screen_id,
      campaign_id,
      creative_id,
      played_at
    )
    values ($1, $2, $3, $4)
    returning *
    `,
    [screenId, resolvedCampaignId, resolvedCreativeId, playedAt]
  )

  return rows[0] ?? null
}