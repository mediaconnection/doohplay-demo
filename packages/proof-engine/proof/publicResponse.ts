// @ts-nocheck
import type {
  FailureReason,
  LayerResult,
  ProofMeta,
  ProofResult,
  TrustLevel,
  VerificationStatus
} from "./types"

/* =========================
   TYPES
========================= */

export type PublicVerifyCertificate = {
  issuer?: string | null
  subject?: string | null
  serial?: string | null
  hash?: string | null
  created_at?: string | null
  valid?: boolean | null
}

export type PublicVerifyTsa = {
  authority?: string | null
  timestamp?: string | null
  valid?: boolean | null
}

export type PublicVerifyAnchor = {
  network?: string | null
  tx_hash?: string | null
  block?: string | number | null
  confirmed?: boolean | null
  anchored?: boolean | null
}

export type PublicVerifyDetails = {
  signature?: boolean | null
  merkle?: boolean | null
  chain?: boolean | null
  revoked?: boolean | null
}

export type PublicVerifyChain = {
  valid?: boolean | null
  depth?: number | null
  errors?: string[] | null
}

export type PublicVerifyEvent = {
  hash?: string | null
  timestamp?: string | null
  merkle_root?: string | null
}

export type PublicVerificationSection = {
  event_exists: boolean
  certificate_exists: boolean
  event_hash_valid: boolean
  merkle_valid: boolean
  certificate_hash_valid: boolean
  signature_valid: boolean
  cert_chain_valid: boolean
  revoked: boolean
  integrity: boolean
}

export type PublicVerifyResponse = {
  success: boolean
  status: VerificationStatus
  trust: TrustLevel
  score: number
  risk: "LOW" | "MEDIUM" | "HIGH"
  blockchain: boolean
  reasons: FailureReason[]

  details: PublicVerifyDetails
  verification: PublicVerificationSection
  chain: PublicVerifyChain
  anchor: PublicVerifyAnchor | null
  event: PublicVerifyEvent | null
  certificate: PublicVerifyCertificate | null
  tsa: PublicVerifyTsa | null

  explanation?: ProofResult["explanation"]
  layers: LayerResult[]
  meta?: ProofMeta
  debug?: {
    latency_ms?: number
    errors?: string[]
  }
}

/* =========================
   HELPERS
========================= */

function toBool(value: unknown): boolean {
  return value === true
}

function toStringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : []
}

function clampScore(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}

function clampNonNegativeInt(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0
  return Math.max(0, Math.floor(value))
}

function getRiskFromTrust(trust: TrustLevel): "LOW" | "MEDIUM" | "HIGH" {
  if (trust === "HIGH") return "LOW"
  if (trust === "MEDIUM") return "MEDIUM"
  return "HIGH"
}

function getLayer(layers: LayerResult[], name: LayerResult["name"]) {
  return layers.find((layer) => layer.name === name)
}

function getMetaValue<T = unknown>(
  meta: Record<string, unknown> | undefined,
  key: string
): T | undefined {
  return meta?.[key] as T | undefined
}

function normalizeReasons(reasons: unknown): FailureReason[] {
  if (!Array.isArray(reasons)) return []

  return [...new Set(
    reasons.filter(
      (reason): reason is FailureReason => typeof reason === "string"
    )
  )]
}

/* =========================
   PUBLIC MAPPER
========================= */

export function toPublicVerifyResponse(
  result: ProofResult,
  options?: {
    startedAt?: number
    errors?: string[]
  }
): PublicVerifyResponse {
  const layers = Array.isArray(result.layers) ? result.layers : []
  const reasons = normalizeReasons(result.reasons)

  const icpLayer = getLayer(layers, "icp")
  const merkleLayer = getLayer(layers, "merkle")
  const blockchainLayer = getLayer(layers, "blockchain")

  const icpMeta = (icpLayer?.meta ?? {}) as Record<string, unknown>
  const merkleMeta = (merkleLayer?.meta ?? {}) as Record<string, unknown>
  const blockchainMeta = (blockchainLayer?.meta ?? {}) as Record<string, unknown>

  const signatureValid = toBool(
    getMetaValue(icpMeta, "signature_valid") ??
      getMetaValue(icpMeta, "signature_present") ??
      icpLayer?.valid
  )

  const certificateHashValid =
    toBool(getMetaValue(icpMeta, "hash_match")) ||
    !reasons.includes("HASH_MISMATCH")

  const chainValid = toBool(
    getMetaValue(icpMeta, "chain_valid") ?? icpLayer?.valid
  )

  const revoked = toBool(
    getMetaValue(icpMeta, "revoked")
  )

  const merkleValid = toBool(
    getMetaValue(merkleMeta, "proof_valid") ?? merkleLayer?.valid
  )

  const anchored = toBool(
    getMetaValue(blockchainMeta, "anchored") ?? blockchainLayer?.valid
  )

  const eventExists =
    typeof result.meta?.entity_id === "string" &&
    result.meta.entity_id.trim().length > 0

  const certificateExists = toBool(
    getMetaValue(icpMeta, "certification_found") ??
      result.meta?.certification_found
  )

  const hasMerkleRoot = Boolean(
    toStringOrNull(getMetaValue(merkleMeta, "merkle_root"))
  )

  const eventHashValid =
    toBool(getMetaValue(icpMeta, "hash_match")) ||
    toBool(getMetaValue(merkleMeta, "hash_match")) ||
    !reasons.includes("HASH_MISMATCH")

  const baseIntegrity =
    eventHashValid &&
    (!hasMerkleRoot || merkleValid) &&
    (!certificateExists ||
      (certificateHashValid && signatureValid && chainValid && !revoked))

  const integrity = blockchainLayer
    ? baseIntegrity && anchored
    : baseIntegrity

  const score = clampScore(result.score)
  const risk = getRiskFromTrust(result.trust)

  const chainErrors = toStringArray(
    getMetaValue(blockchainMeta, "chain_errors") ??
      getMetaValue(icpMeta, "chain_errors")
  )

  const chainDepth = clampNonNegativeInt(
    getMetaValue(blockchainMeta, "chain_depth") ??
      getMetaValue(icpMeta, "chain_depth")
  )

  const txHash =
    toStringOrNull(getMetaValue(blockchainMeta, "tx_hash")) ??
    toStringOrNull(getMetaValue(blockchainMeta, "blockchain_tx"))

  const eventHash =
    toStringOrNull(getMetaValue(merkleMeta, "leaf_hash")) ??
    toStringOrNull(result.meta?.hash)

  const eventTimestamp =
    toStringOrNull(getMetaValue(icpMeta, "created_at")) ??
    toStringOrNull(getMetaValue(merkleMeta, "created_at")) ??
    null

  const merkleRoot =
    toStringOrNull(getMetaValue(merkleMeta, "merkle_root")) ??
    null

  const certificateHash =
    toStringOrNull(getMetaValue(icpMeta, "certified_hash")) ??
    toStringOrNull(getMetaValue(icpMeta, "content_hash")) ??
    null

  const latencyMs =
    typeof options?.startedAt === "number" && Number.isFinite(options.startedAt)
      ? Math.max(0, Date.now() - options.startedAt)
      : undefined

  const debugErrors = Array.isArray(options?.errors)
    ? options.errors.filter((item): item is string => typeof item === "string")
    : []

  return {
    success: result.status !== "FAILED",
    status: result.status,
    trust: result.trust,
    score,
    risk,
    blockchain: anchored,
    reasons,

    details: {
      signature: signatureValid,
      merkle: merkleValid,
      chain: chainValid,
      revoked
    },

    verification: {
      event_exists: eventExists,
      certificate_exists: certificateExists,
      event_hash_valid: eventHashValid,
      merkle_valid: merkleValid,
      certificate_hash_valid: certificateHashValid,
      signature_valid: signatureValid,
      cert_chain_valid: chainValid,
      revoked,
      integrity
    },

    chain: {
      valid: chainValid,
      depth: chainDepth,
      errors: chainErrors
    },

    anchor: blockchainLayer
      ? {
          network:
            toStringOrNull(getMetaValue(blockchainMeta, "network")) ?? "polygon",
          tx_hash: txHash,
          block: getMetaValue(blockchainMeta, "block") ?? null,
          confirmed: toBool(getMetaValue(blockchainMeta, "confirmations_ok")),
          anchored
        }
      : null,

    event: eventHash || eventTimestamp || merkleRoot
      ? {
          hash: eventHash,
          timestamp: eventTimestamp,
          merkle_root: merkleRoot
        }
      : null,

    certificate: certificateExists
      ? {
          issuer: toStringOrNull(getMetaValue(icpMeta, "issuer")),
          subject: toStringOrNull(getMetaValue(icpMeta, "subject")),
          serial: toStringOrNull(getMetaValue(icpMeta, "serial")),
          hash: certificateHash,
          created_at: toStringOrNull(getMetaValue(icpMeta, "created_at")),
          valid:
            certificateHashValid &&
            signatureValid &&
            chainValid &&
            !revoked
        }
      : null,

    tsa: null,

    explanation: result.explanation,
    layers,
    meta: result.meta,

    debug:
      latencyMs !== undefined || debugErrors.length > 0
        ? {
            latency_ms: latencyMs,
            errors: debugErrors
          }
        : undefined
  }
}
