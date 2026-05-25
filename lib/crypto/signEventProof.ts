// @ts-nocheck
import crypto from "crypto"

import {
  signHashWithA1,
  verifyHashSignatureWithA1Certificate,
  type CertificateInfo
} from "@/lib/crypto/signWithA1"

/* =========================
   TYPES
========================= */

export type SignEventProofInput = {
  eventHash: string
  payloadHash: string
  deviceId?: string | null
  campaignId?: string | null
  sourceTable: string
  sourceId: string
  occurredAt: string
  metadata?: Record<string, unknown> | null
}

export type SignedEventProof = {
  signature: string
  signature_algorithm: string
  digest_algorithm: "SHA-256"
  signature_encoding: "base64"

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

function normalizeHash(value?: string | null): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^0x/, "")
}

function isSha256Hex(value?: string | null): boolean {
  return /^[a-f0-9]{64}$/i.test(normalizeHash(value))
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
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

function certValue(
  cert: CertificateInfo,
  key: keyof CertificateInfo
): string {
  const value = cert[key]
  return typeof value === "string" ? value : ""
}

/* =========================
   CORE
========================= */

export function buildEventProofPayload(input: SignEventProofInput): {
  canonical: string
  hash: string
} {
  const eventHash = normalizeHash(input.eventHash)
  const payloadHash = normalizeHash(input.payloadHash)

  if (!isSha256Hex(eventHash)) {
    throw new Error("INVALID_EVENT_HASH")
  }

  if (!isSha256Hex(payloadHash)) {
    throw new Error("INVALID_PAYLOAD_HASH")
  }

  const proofPayload = {
    event_hash: eventHash,
    payload_hash: payloadHash,
    device_id: input.deviceId ?? null,
    campaign_id: input.campaignId ?? null,
    source_table: input.sourceTable,
    source_id: input.sourceId,
    occurred_at: input.occurredAt,
    metadata: isObject(input.metadata) ? input.metadata : {}
  }

  const canonical = canonicalize(proofPayload)

  return {
    canonical,
    hash: sha256Hex(canonical)
  }
}

export function signEventProof(
  input: SignEventProofInput
): SignedEventProof {
  const proofPayload = buildEventProofPayload(input)

  const signed = signHashWithA1({
    hash: proofPayload.hash,
    hashEncoding: "hex",
    outputEncoding: "base64"
  })

  return {
    signature: signed.signature,
    signature_algorithm: signed.algorithm,
    digest_algorithm: "SHA-256",
    signature_encoding: "base64",

    certificate_fingerprint: certValue(
      signed.certificate,
      "fingerprintSha256"
    ),
    certificate_subject: certValue(signed.certificate, "subject"),
    certificate_issuer: certValue(signed.certificate, "issuer"),
    certificate_serial_number: certValue(
      signed.certificate,
      "serialNumber"
    ),
    certificate_valid_from: signed.certificate.validFrom ?? null,
    certificate_valid_to: signed.certificate.validTo ?? null,
    certificate_days_remaining:
      typeof signed.certificate.daysRemaining === "number"
        ? signed.certificate.daysRemaining
        : null,

    proof_payload_hash: proofPayload.hash,
    proof_payload_canonical: proofPayload.canonical,
    signed_at: new Date().toISOString()
  }
}

export function verifyEventProof(input: {
  proof_payload_hash: string
  signature: string
  signature_encoding?: "base64" | "hex"
}): boolean {
  const proofPayloadHash = normalizeHash(input.proof_payload_hash)

  if (!isSha256Hex(proofPayloadHash)) return false

  return verifyHashSignatureWithA1Certificate({
    hash: proofPayloadHash,
    hashEncoding: "hex",
    signature: input.signature,
    signatureEncoding: input.signature_encoding || "base64"
  })
}
