// @ts-nocheck
export type SignedEventRecord = {
  event_id: string
  hash: string
  event_hash: string
  previous_event_hash: string | null
  event_type: string
  source_table: string
  source_id: string
  device_id: string | null
  campaign_id: string | null
  occurred_at: string
  payload: Record<string, unknown>
  payload_hash: string
  proof_payload_hash: string
  proof_payload_canonical: string
  signature: string
  signature_algorithm: string
  signature_encoding: string
  digest_algorithm: string
  signed_at: string
  created_at: string
  certificate_fingerprint: string | null
  certificate_subject: string | null
  certificate_issuer: string | null
  certificate_serial_number: string | null
  certificate_valid_from: string | null
  certificate_valid_to: string | null
  certificate_days_remaining: number | null
}

export async function createSignedEventRecord(
  _payload: Record<string, unknown>
): Promise<SignedEventRecord> {
  throw new Error("createSignedEventRecord: not implemented")
}

