// @ts-nocheck
import { getLayerCache, setLayerCache } from "../cache/layerCache"
import { keys } from "../cache/keys"
import type { FailureReason, LayerResult, ProofContext } from "../types"

/* =========================
   CONFIG
========================= */

const TTL_ICP_SECONDS = 60 * 30 // 30 minutos
const TTL_ICP_FAIL_SECONDS = 60 * 5 // 5 minutos
const ICP_WEIGHT = 40

/* =========================
   HELPERS
========================= */

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

function isLayerResult(value: unknown): value is LayerResult {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.valid === "boolean"
  )
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim()
  return normalized || null
}

function normalizeHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return normalized || null
}

function uniqueReasons(reasons: FailureReason[]): FailureReason[] {
  return [...new Set(reasons)]
}

function hasCertificateMaterial(ctx: ProofContext): boolean {
  return Boolean(
    normalizeString(ctx.cert?.certificate_url) ||
      normalizeString(ctx.cert?.signature)
  )
}

function buildFailLayer(
  reasons: FailureReason[],
  meta: Record<string, unknown> = {},
  durationMs?: number
): LayerResult {
  const normalizedReasons = uniqueReasons(reasons)

  return {
    name: "icp",
    valid: false,
    weight: ICP_WEIGHT,
    reasons: normalizedReasons,
    message: "ICP validation failed",
    error: normalizedReasons[0] ?? "ICP_FAIL",
    details: null,
    duration_ms:
      typeof durationMs === "number" && Number.isFinite(durationMs)
        ? durationMs
        : undefined,
    meta: {
      reasons: normalizedReasons,
      ...meta,
      duration_ms:
        typeof durationMs === "number" && Number.isFinite(durationMs)
          ? durationMs
          : undefined
    }
  }
}

function getEntityMatches(ctx: ProofContext): {
  hashMatch: boolean
  entityIdMatch: boolean
  entityTypeMatch: boolean
  expectedHash: string | null
  certifiedHash: string | null
  expectedEntityId: string | null
  certifiedEntityId: string | null
  expectedEntityType: string | null
  certifiedEntityType: string | null
} {
  const expectedHash = normalizeHash(ctx.input.hash)
  const certifiedHash = normalizeHash(ctx.cert?.content_hash)

  const expectedEntityId = normalizeString(ctx.input.entity_id)
  const certifiedEntityId = normalizeString(ctx.cert?.entity_id)

  const expectedEntityType = normalizeString(ctx.input.entity_type)
  const certifiedEntityType = normalizeString(ctx.cert?.entity_type)

  return {
    expectedHash,
    certifiedHash,
    expectedEntityId,
    certifiedEntityId,
    expectedEntityType,
    certifiedEntityType,
    hashMatch:
      !!expectedHash &&
      !!certifiedHash &&
      expectedHash === certifiedHash,
    entityIdMatch:
      !!expectedEntityId &&
      !!certifiedEntityId &&
      expectedEntityId === certifiedEntityId,
    entityTypeMatch:
      !!expectedEntityType &&
      !!certifiedEntityType &&
      expectedEntityType === certifiedEntityType
  }
}

function getCacheKey(ctx: ProofContext): string {
  const hash = normalizeHash(ctx.input.hash) ?? "unknown"
  const entityId = normalizeString(ctx.input.entity_id) ?? "unknown"
  const entityType = normalizeString(ctx.input.entity_type) ?? "unknown"

  if (typeof keys.icp === "function") {
    try {
      return keys.icp(hash, entityId, entityType)
    } catch {
      try {
        return keys.icp(hash)
      } catch {
        return `icp:${hash}:${entityType}:${entityId}`
      }
    }
  }

  return `icp:${hash}:${entityType}:${entityId}`
}

function buildSuccessMessage(
  hashMatch: boolean,
  entityIdMatch: boolean,
  entityTypeMatch: boolean
): string {
  if (hashMatch && entityIdMatch && entityTypeMatch) {
    return "ICP layer validated successfully"
  }

  return "ICP validation completed with inconsistencies"
}

function buildFailureMessage(reasons: FailureReason[]): string {
  if (reasons.includes("HASH_MISMATCH")) {
    return "ICP validation failed due to hash mismatch"
  }

  if (reasons.includes("CHAIN_INVALID")) {
    return "ICP validation failed due to entity identity mismatch"
  }

  if (reasons.includes("PROOF_NOT_FOUND")) {
    return "ICP validation failed because certification record was not found"
  }

  return "ICP validation failed"
}

/* =========================
   LAYER
========================= */

export async function icpLayer(
  ctx: ProofContext
): Promise<LayerResult> {
  const startedAt = Date.now()

  try {
    if (!ctx.cert) {
      const failed = buildFailLayer(
        ["PROOF_NOT_FOUND"],
        {
          detail: "Certification record not found",
          certification_found: false,
          input_hash: normalizeHash(ctx.input.hash),
          input_entity_id: normalizeString(ctx.input.entity_id),
          input_entity_type: normalizeString(ctx.input.entity_type),
          certificate_present: false,
          certificate_valid: false,
          cert_chain_valid: false,
          certificate_revoked: false,
          signature_present: false,
          signature_valid: false,
          chain_valid: false,
          revoked: false
        },
        Date.now() - startedAt
      )

      return failed
    }

    const cacheKey = getCacheKey(ctx)
    const cached = await getLayerCache(cacheKey)

    if (isLayerResult(cached)) {
      return cached
    }

    const certId = normalizeString(ctx.cert.id)
    const certificateUrl = normalizeString(ctx.cert.certificate_url)
    const signature = normalizeString(ctx.cert.signature)
    const certificateMaterialPresent = hasCertificateMaterial(ctx)

    const {
      hashMatch,
      entityIdMatch,
      entityTypeMatch,
      expectedHash,
      certifiedHash,
      expectedEntityId,
      certifiedEntityId,
      expectedEntityType,
      certifiedEntityType
    } = getEntityMatches(ctx)

    if (!certifiedHash) {
      const failed = buildFailLayer(
        ["ICP_FAIL"],
        {
          detail: "Certification record missing content hash",
          certification_found: true,
          certification_id: certId,
          certificate_url: certificateUrl,
          certificate_present: certificateMaterialPresent,
          certificate_valid: certificateMaterialPresent,
          cert_chain_valid: entityIdMatch && entityTypeMatch,
          certificate_revoked: false,
          signature_present: Boolean(signature),
          signature_valid: Boolean(signature),
          chain_valid: false,
          revoked: false
        },
        Date.now() - startedAt
      )

      await setLayerCache(cacheKey, failed, TTL_ICP_FAIL_SECONDS)
      return failed
    }

    const reasons: FailureReason[] = []

    if (!hashMatch) {
      reasons.push("HASH_MISMATCH")
    }

    if (!entityIdMatch || !entityTypeMatch) {
      reasons.push("CHAIN_INVALID")
    }

    const finalReasons = uniqueReasons(reasons)
    const durationMs = Date.now() - startedAt
    const valid = finalReasons.length === 0

    const layer: LayerResult = {
      name: "icp",
      valid,
      weight: ICP_WEIGHT,
      reasons: finalReasons,
      message: valid
        ? buildSuccessMessage(hashMatch, entityIdMatch, entityTypeMatch)
        : buildFailureMessage(finalReasons),
      error: finalReasons.length > 0 ? finalReasons[0] : null,
      details: null,
      duration_ms: durationMs,
      meta: {
        reasons: finalReasons,
        detail: valid
          ? "ICP layer validated successfully"
          : buildFailureMessage(finalReasons),
        certification_found: true,
        certification_id: certId,
        input_hash: expectedHash,
        certified_hash: certifiedHash,
        hash_match: hashMatch,
        input_entity_id: expectedEntityId,
        certified_entity_id: certifiedEntityId,
        entity_id_match: entityIdMatch,
        input_entity_type: expectedEntityType,
        certified_entity_type: certifiedEntityType,
        entity_type_match: entityTypeMatch,
        certificate_url: certificateUrl,
        signature_present: Boolean(signature),
        signature_valid: Boolean(signature),
        certificate_present: certificateMaterialPresent,
        certificate_valid: certificateMaterialPresent,
        cert_chain_valid: entityIdMatch && entityTypeMatch,
        certificate_revoked: false,
        chain_valid: entityIdMatch && entityTypeMatch,
        revoked: false,
        created_at:
          typeof ctx.cert.created_at === "string"
            ? ctx.cert.created_at
            : null,
        duration_ms: durationMs
      }
    }

    await setLayerCache(
      cacheKey,
      layer,
      layer.valid ? TTL_ICP_SECONDS : TTL_ICP_FAIL_SECONDS
    )

    return layer
  } catch (error) {
    const failed = buildFailLayer(
      ["ICP_FAIL"],
      {
        detail: "Unexpected error during ICP layer execution",
        error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
        certificate_present: false,
        certificate_valid: false,
        cert_chain_valid: false,
        certificate_revoked: false,
        signature_present: false,
        signature_valid: false,
        chain_valid: false,
        revoked: false
      },
      Date.now() - startedAt
    )

    return failed
  }
}
