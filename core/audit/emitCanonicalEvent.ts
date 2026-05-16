import { createSignedEventRecord } from "@/lib/domain/proof/createSignedEventRecord"
import { pool } from "@/lib/db"
import { logEvent } from "@/lib/logging/logEvent"
import { LOG_EVENT_TYPES } from "@/lib/logging/logEventTypes"

export type EmitCanonicalEventInput = {
  event_type: string
  source_table: string
  source_id: string
  device_id?: string | null
  campaign_id?: string | null
  occurred_at?: string | null
  payload?: Record<string, unknown> | null
  previous_event_hash?: string | null
}

type InsertedRow = {
  id: number
}

export async function emitCanonicalEvent(input: EmitCanonicalEventInput) {
  const record = await createSignedEventRecord({
    eventType: input.event_type,
    sourceTable: input.source_table,
    sourceId: input.source_id,
    deviceId: input.device_id,
    campaignId: input.campaign_id,
    occurredAt: input.occurred_at,
    previousEventHash: input.previous_event_hash,
    payload: input.payload ?? {}
  })

  const result = await pool.query(
    `
    INSERT INTO public.event_chain (
      event_type,
      source_table,
      source_id,
      device_id,
      campaign_id,
      occurred_at,
      payload,
      payload_hash,
      previous_event_hash,
      event_hash,

      signature,
      signature_algorithm,
      signature_encoding,
      digest_algorithm,

      certificate_fingerprint,
      certificate_subject,
      certificate_issuer,
      certificate_serial_number,
      certificate_valid_from,
      certificate_valid_to,
      certificate_days_remaining,

      proof_payload_hash,
      proof_payload_canonical,
      signed_at
    )
    VALUES (
      $1,  $2,  $3,  $4,  $5,  $6::timestamptz, $7::jsonb, $8,  $9,  $10,
      $11, $12, $13, $14,
      $15, $16, $17, $18, $19::timestamptz, $20::timestamptz, $21,
      $22, $23, $24::timestamptz
    )
    RETURNING id
    `,
    [
      record.event_type,
      record.source_table,
      record.source_id,
      record.device_id,
      record.campaign_id,
      record.occurred_at,
      JSON.stringify(record.payload),
      record.payload_hash,
      record.previous_event_hash,
      record.event_hash,

      record.signature,
      record.signature_algorithm,
      record.signature_encoding,
      record.digest_algorithm,

      record.certificate_fingerprint,
      record.certificate_subject,
      record.certificate_issuer,
      record.certificate_serial_number,
      record.certificate_valid_from,
      record.certificate_valid_to,
      record.certificate_days_remaining,

      record.proof_payload_hash,
      record.proof_payload_canonical,
      record.signed_at
    ]
  )

  const rows = result.rows as InsertedRow[]
  const inserted = rows[0] ?? null
  const id = inserted?.id ?? null

  await logEvent({
    type: LOG_EVENT_TYPES.AUDIT_EVENT_EMITTED,
    level: "INFO",
    message: "Canonical event emitted",
    entity_id: id !== null ? String(id) : "",
    entity_type: "event",
    source: "emitCanonicalEvent",
    metadata: {
      event_hash: record.event_hash,
      source_table: record.source_table,
      source_id: record.source_id,
      signature_algorithm: record.signature_algorithm
    }
  })

  return {
    ok: true,
    id,
    event_hash: record.event_hash,
    payload_hash: record.payload_hash,
    proof_payload_hash: record.proof_payload_hash,
    signature_algorithm: record.signature_algorithm,
    signed_at: record.signed_at
  }
}