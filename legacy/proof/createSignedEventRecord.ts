import crypto from "crypto"
import { signEventProof } from "../../crypto/signEventProof"

/* =========================
   TYPES
========================= */

export type CreateSignedEventRecordInput = {
  eventType: string
  sourceTable: string
  sourceId: string
  deviceId?: string | null
  campaignId?: string | null
  occurredAt?: string | null
  previousEventHash?: string | null
  payload?: Record<string, unknown> | null
}

export type SignedEventRecord = {
  event_type: string
  source_table: string
  source_id: string
  device_id: string | null
  campaign_id: string | null
  occurred_at: string
  payload: Record<string, unknown>
  payload_hash: string
  previous_event_hash: string | null
  event_hash: string

  signature: string
  signature_algorithm: string
  digest_algorithm: "SHA-256"
  signature_encoding: "base64" | "hex"

  certificate_fingerprint: string
  certificate_subject: string
  certificate_issuer: string
  certificate_serial_number: string
  certificate_valid_from: string | null
  certificate_valid_to: string | null
  certificate_days_remaining: number | null

  proof_payload_hash: string
  proof_payload_canonical: string
  signed_at: string
}

/* =========================
   HELPERS
========================= */

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeHash(value?: string | null): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^0x/, "")
}

function with0x(value: string): string {
  return `0x${normalizeHash(value)}`
}

function isValidSha256Hex(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/i.test(normalizeHash(value))
}

function normalizePreviousHash(value?: string | null): string | null {
  const hash = safeString(value)
  if (!hash) return null

  const normalized = normalizeHash(hash)

  if (!isValidSha256Hex(normalized)) {
    throw new Error("previousEventHash inválido")
  }

  return with0x(normalized)
}

function sortObjectDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObjectDeep)
  }

  if (isObject(value)) {
    return Object.keys(value)
      .sort((a, b) => a.localeCompare(b))
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortObjectDeep(value[key])
        return acc
      }, {})
  }

  return value
}

function canonicalize(value: unknown): string {
  return JSON.stringify(sortObjectDeep(value))
}

function sha256Hex(value: string): string {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex")
}

/* =========================
   CORE
========================= */

export function createSignedEventRecord(
  input: CreateSignedEventRecordInput
): SignedEventRecord {
  const eventType = safeString(input.eventType)
  const sourceTable = safeString(input.sourceTable)
  const sourceId = safeString(input.sourceId)

  if (!eventType) throw new Error("eventType é obrigatório")
  if (!sourceTable) throw new Error("sourceTable é obrigatório")
  if (!sourceId) throw new Error("sourceId é obrigatório")

  const occurredAt = safeString(input.occurredAt) ?? new Date().toISOString()
  const deviceId = safeString(input.deviceId)
  const campaignId = safeString(input.campaignId)
  const previousEventHash = normalizePreviousHash(input.previousEventHash)
  const payload = isObject(input.payload) ? input.payload : {}

  const payloadCanonical = canonicalize(payload)
  const payloadHashHex = sha256Hex(payloadCanonical)

  if (!isValidSha256Hex(payloadHashHex)) {
    throw new Error("Falha ao gerar payload_hash válido")
  }

  const payloadHash = with0x(payloadHashHex)

  const eventHashMaterial = canonicalize({
    event_type: eventType,
    source_table: sourceTable,
    source_id: sourceId,
    device_id: deviceId,
    campaign_id: campaignId,
    occurred_at: occurredAt,
    payload_hash: payloadHash,
    previous_event_hash: previousEventHash
  })

  const eventHashHex = sha256Hex(eventHashMaterial)

  if (!isValidSha256Hex(eventHashHex)) {
    throw new Error("Falha ao gerar event_hash válido")
  }

  const eventHash = with0x(eventHashHex)

  const proof = signEventProof({
    eventHash: eventHashHex,
    payloadHash: payloadHashHex,
    deviceId,
    campaignId,
    sourceTable,
    sourceId,
    occurredAt,
    metadata: {
      event_type: eventType,
      previous_event_hash: previousEventHash,
      payload
    }
  })

  return {
    event_type: eventType,
    source_table: sourceTable,
    source_id: sourceId,
    device_id: deviceId,
    campaign_id: campaignId,
    occurred_at: occurredAt,
    payload,
    payload_hash: payloadHash,
    previous_event_hash: previousEventHash,
    event_hash: eventHash,

    signature: proof.signature,
    signature_algorithm: proof.signature_algorithm,
    digest_algorithm: proof.digest_algorithm,
    signature_encoding: proof.signature_encoding,

    certificate_fingerprint: proof.certificate_fingerprint,
    certificate_subject: proof.certificate_subject,
    certificate_issuer: proof.certificate_issuer,
    certificate_serial_number: proof.certificate_serial_number,
    certificate_valid_from: proof.certificate_valid_from,
    certificate_valid_to: proof.certificate_valid_to,
    certificate_days_remaining: proof.certificate_days_remaining,

    proof_payload_hash: proof.proof_payload_hash,
    proof_payload_canonical: proof.proof_payload_canonical,
    signed_at: proof.signed_at
  }
}