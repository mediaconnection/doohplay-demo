// @ts-nocheck
export type EvidenceType =
  | "playback_proof"
  | "impression_proof"
  | "audience_proof"
  | "sensor_proof"
  | "location_proof"
  | "screen_state"

export interface Evidence {

  id: string

  type: EvidenceType

  source?: string

  hash: string

  metadata?: Record<string, any>

  impression_id?: string | null

  campaign_id?: string | null

  screen_id?: string | null

  created_at: string

}
