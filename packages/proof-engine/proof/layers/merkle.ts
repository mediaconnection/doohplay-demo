// @ts-nocheck
import {
  verifyMerkleProofDetailed,
  type MerkleProofNode
} from "@proof-engine/proof/merkle/verifyMerkleProof"

import { setLayerCache } from "../cache/layerCache"
import { keys } from "../cache/keys"
import type { FailureReason, LayerResult, ProofContext } from "../types"

const TTL_MERKLE_SECONDS = 60 * 60 * 24 * 7
const TTL_MERKLE_FAIL_SECONDS = 60 * 10
const MERKLE_WEIGHT = 30

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const normalized = value.trim()
  return normalized || null
}

function normalizeHash(hash: unknown): string | null {
  if (typeof hash !== "string") return null
  const normalized = hash.trim().toLowerCase().replace(/^0x/, "")
  return normalized || null
}

function isHex64(value: string | null | undefined): boolean {
  return typeof value === "string" && /^[a-f0-9]{64}$/i.test(value)
}

function normalizeProof(proof: unknown): MerkleProofNode[] {
  if (!Array.isArray(proof)) return []

  const normalized: MerkleProofNode[] = []

  for (const item of proof) {
    if (typeof item === "string") {
      const hash = normalizeHash(item)
      if (hash && isHex64(hash)) normalized.push(hash)
      continue
    }

    if (!item || typeof item !== "object" || Array.isArray(item)) continue

    const record = item as {
      hash?: unknown
      sibling?: unknown
      value?: unknown
      position?: unknown
      side?: unknown
      direction?: unknown
    }

    const rawHash = record.hash ?? record.sibling ?? record.value
    const rawPosition = record.position ?? record.side ?? record.direction

    const hash = normalizeHash(rawHash)
    if (!hash || !isHex64(hash)) continue

    const position =
      rawPosition === "left" || rawPosition === "right"
        ? rawPosition
        : undefined

    normalized.push(position ? { hash, position } : { hash })
  }

  return normalized
}

function getMerkleCacheKey(params: {
  entityId: string
  entityType: string
  hash: string
  root: string
}): string {
  const entityId = normalizeString(params.entityId) ?? "unknown"
  const entityType = normalizeString(params.entityType) ?? "unknown"
  const hash = normalizeHash(params.hash) ?? "unknown"
  const root = normalizeHash(params.root) ?? "unknown"

  if (typeof keys.merkle === "function") {
    try {
      return keys.merkle(`${entityType}:${entityId}:${hash}`, root)
    } catch {
      try {
        return keys.merkle(`${entityType}:${entityId}:${hash}`)
      } catch {
        return `merkle:${entityType}:${entityId}:${hash}:${root}`
      }
    }
  }

  return `merkle:${entityType}:${entityId}:${hash}:${root}`
}

function uniqueReasons(reasons: FailureReason[]): FailureReason[] {
  return [...new Set(reasons)]
}

function buildFailLayer(
  reasons: FailureReason[],
  meta: Record<string, unknown> = {},
  durationMs?: number
): LayerResult {
  const normalizedReasons = uniqueReasons(reasons)

  return {
    name: "merkle",
    valid: false,
    weight: MERKLE_WEIGHT,
    reasons: normalizedReasons,
    message: "Merkle validation failed",
    error: normalizedReasons[0] ?? "MERKLE_FAIL",
    details: null,
    duration_ms:
      typeof durationMs === "number" && Number.isFinite(durationMs)
        ? durationMs
        : undefined,
    meta: {
      reasons: normalizedReasons,
      proof_valid: false,
      merkle_proof_valid: false,
      merkle_root_valid: false,
      ...meta,
      duration_ms:
        typeof durationMs === "number" && Number.isFinite(durationMs)
          ? durationMs
          : undefined
    }
  }
}

function buildSuccessLayer(
  meta: Record<string, unknown>,
  durationMs: number,
  message = "Merkle proof validated successfully"
): LayerResult {
  return {
    name: "merkle",
    valid: true,
    weight: MERKLE_WEIGHT,
    reasons: [],
    message,
    error: null,
    details: null,
    duration_ms: durationMs,
    meta: {
      reasons: [],
      proof_valid: true,
      merkle_proof_valid: true,
      merkle_root_valid: true,
      ...meta,
      duration_ms: durationMs
    }
  }
}

function buildFailureMessage(reasons: FailureReason[]): string {
  if (reasons.includes("HASH_MISMATCH")) {
    return "Merkle validation failed due to hash mismatch"
  }

  if (reasons.includes("INVALID_MERKLE_ROOT")) {
    return "Merkle validation failed due to invalid or missing Merkle root"
  }

  if (reasons.includes("INVALID_MERKLE_PROOF")) {
    return "Merkle validation failed due to invalid or missing Merkle proof"
  }

  return "Merkle validation failed"
}

export async function merkleLayer(
  ctx: ProofContext
): Promise<LayerResult> {
  const startedAt = Date.now()

  try {
    const inputHash = normalizeHash(ctx.input.hash)
    const certHash = normalizeHash(ctx.cert?.content_hash)
    const merkleRoot = normalizeHash(ctx.cert?.merkle_root)
    const merkleProof = normalizeProof(ctx.cert?.merkle_proof)

    const signaturePresent = Boolean(normalizeString(ctx.cert?.signature))
    const blockchainTx =
      normalizeString(ctx.cert?.tx_hash) ??
      normalizeString(ctx.cert?.blockchain_tx)

    if (!inputHash || !isHex64(inputHash)) {
      return buildFailLayer(
        ["INVALID_INPUT"],
        {
          detail: "Missing or invalid input hash",
          leaf_hash: inputHash,
          certification_found: Boolean(ctx.cert),
          proof_present: false,
          proof_length: 0,
          proof_depth: 0,
          anchored: Boolean(blockchainTx),
          blockchain_tx: blockchainTx,
          signature_present: signaturePresent
        },
        Date.now() - startedAt
      )
    }

    if (!ctx.cert) {
      return buildFailLayer(
        ["PROOF_NOT_FOUND"],
        {
          detail: "Certification record not found",
          leaf_hash: inputHash,
          entity_id: ctx.input.entity_id,
          entity_type: ctx.input.entity_type,
          certification_found: false,
          proof_present: false,
          proof_length: 0,
          proof_depth: 0,
          anchored: false,
          blockchain_tx: null,
          signature_present: false
        },
        Date.now() - startedAt
      )
    }

    if (!certHash || !isHex64(certHash)) {
      return buildFailLayer(
        ["MERKLE_FAIL"],
        {
          detail: "Missing or invalid certification content hash",
          input_hash: inputHash,
          certification_hash: certHash,
          certification_found: true,
          proof_present: merkleProof.length > 0,
          proof_length: merkleProof.length,
          proof_depth: merkleProof.length,
          anchored: Boolean(blockchainTx),
          blockchain_tx: blockchainTx,
          signature_present: signaturePresent
        },
        Date.now() - startedAt
      )
    }

    const reasons: FailureReason[] = []

    if (certHash !== inputHash) {
      reasons.push("HASH_MISMATCH")
    }

    if (!merkleRoot || !isHex64(merkleRoot)) {
      const failed = buildFailLayer(
        [...reasons, "INVALID_MERKLE_ROOT"],
        {
          detail: "Missing or invalid Merkle root",
          input_hash: inputHash,
          certification_hash: certHash,
          merkle_root: merkleRoot,
          proof_present: merkleProof.length > 0,
          proof_length: merkleProof.length,
          proof_depth: merkleProof.length,
          certification_found: true,
          hash_match: certHash === inputHash,
          anchored: Boolean(blockchainTx),
          blockchain_tx: blockchainTx,
          signature_present: signaturePresent
        },
        Date.now() - startedAt
      )

      await setLayerCache(
        getMerkleCacheKey({
          entityId: ctx.input.entity_id,
          entityType: ctx.input.entity_type,
          hash: inputHash,
          root: "invalid-root"
        }),
        failed,
        TTL_MERKLE_FAIL_SECONDS
      )

      return failed
    }

    if (merkleProof.length === 0 && certHash === merkleRoot) {
      const durationMs = Date.now() - startedAt

      const layer = buildSuccessLayer(
        {
          detail: "Single-leaf Merkle tree: leaf hash equals Merkle root",
          leaf_hash: inputHash,
          certification_hash: certHash,
          input_hash: inputHash,
          merkle_root: merkleRoot,
          computed_root: merkleRoot,
          root_match: true,
          proof_present: false,
          proof_length: 0,
          proof_depth: 0,
          certification_found: true,
          hash_match: certHash === inputHash,
          anchored: Boolean(blockchainTx),
          blockchain_tx: blockchainTx,
          signature_present: signaturePresent
        },
        durationMs,
        "Merkle proof validated as single-leaf tree"
      )

      await setLayerCache(
        getMerkleCacheKey({
          entityId: ctx.input.entity_id,
          entityType: ctx.input.entity_type,
          hash: inputHash,
          root: merkleRoot
        }),
        layer,
        TTL_MERKLE_SECONDS
      )

      return layer
    }

    if (merkleProof.length === 0) {
      const failed = buildFailLayer(
        [...reasons, "INVALID_MERKLE_PROOF"],
        {
          detail: "Missing or invalid Merkle proof",
          input_hash: inputHash,
          certification_hash: certHash,
          merkle_root: merkleRoot,
          proof_present: false,
          proof_length: 0,
          proof_depth: 0,
          certification_found: true,
          hash_match: certHash === inputHash,
          anchored: Boolean(blockchainTx),
          blockchain_tx: blockchainTx,
          signature_present: signaturePresent
        },
        Date.now() - startedAt
      )

      await setLayerCache(
        getMerkleCacheKey({
          entityId: ctx.input.entity_id,
          entityType: ctx.input.entity_type,
          hash: inputHash,
          root: merkleRoot
        }),
        failed,
        TTL_MERKLE_FAIL_SECONDS
      )

      return failed
    }

    const verification = verifyMerkleProofDetailed({
      leaf: inputHash,
      proof: merkleProof,
      root: merkleRoot,
      mode: "auto"
    })

    if (!verification.valid) {
      reasons.push("MERKLE_FAIL")
    }

    const finalReasons = uniqueReasons(reasons)
    const durationMs = Date.now() - startedAt
    const valid = finalReasons.length === 0

    const computedRoot = normalizeHash(verification.computedRoot ?? null)
    const rootMatch =
      !!computedRoot &&
      !!merkleRoot &&
      computedRoot === merkleRoot

    const layer: LayerResult = {
      name: "merkle",
      valid,
      weight: MERKLE_WEIGHT,
      reasons: finalReasons,
      message:
        valid
          ? "Merkle proof validated successfully"
          : buildFailureMessage(finalReasons),
      error: finalReasons.length > 0 ? finalReasons[0] : null,
      details: null,
      duration_ms: durationMs,
      meta: {
        reasons: finalReasons,
        detail:
          valid
            ? "Merkle proof validated successfully"
            : buildFailureMessage(finalReasons),
        leaf_hash: inputHash,
        certification_hash: certHash,
        input_hash: inputHash,
        merkle_root: merkleRoot,
        computed_root: computedRoot,
        root_match: rootMatch,
        proof_present: merkleProof.length > 0,
        proof_length: merkleProof.length,
        proof_depth: verification.depth,
        proof_error: verification.error ?? null,
        certification_found: true,
        hash_match: certHash === inputHash,
        proof_valid: verification.valid,
        merkle_proof_valid: verification.valid,
        merkle_root_valid: rootMatch,
        anchored: Boolean(blockchainTx),
        blockchain_tx: blockchainTx,
        signature_present: signaturePresent,
        duration_ms: durationMs
      }
    }

    await setLayerCache(
      getMerkleCacheKey({
        entityId: ctx.input.entity_id,
        entityType: ctx.input.entity_type,
        hash: inputHash,
        root: merkleRoot
      }),
      layer,
      layer.valid ? TTL_MERKLE_SECONDS : TTL_MERKLE_FAIL_SECONDS
    )

    return layer
  } catch (error: unknown) {
    return buildFailLayer(
      ["MERKLE_FAIL"],
      {
        detail: "Unexpected error during Merkle layer execution",
        error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
        proof_present: false,
        proof_length: 0,
        proof_depth: 0,
        anchored: false,
        blockchain_tx: null,
        signature_present: false
      },
      Date.now() - startedAt
    )
  }
}

