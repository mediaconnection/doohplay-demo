import crypto from "crypto"

interface AudiencePayload {
  screen_id: string
  campaign_id?: string
  faces: number
  attention: number
  dwell_time: number
  timestamp: string
}

export function computeAudienceHash(payload: AudiencePayload) {

  const raw = [
    payload.screen_id,
    payload.campaign_id || "",
    payload.faces,
    payload.attention,
    payload.dwell_time,
    payload.timestamp
  ].join("|")

  return crypto.createHash("sha256").update(raw).digest("hex")
}