// @ts-nocheck
import { randomUUID } from "crypto"

import type {
  LayerName,
  LayerResult,
  ProofContext,
  ProofInput,
  ProofResult
} from "./types"

import { merkleLayer } from "./layers/merkle"
import { blockchainLayer } from "./layers/blockchain"
import { a1SignatureLayer } from "@proof-engine/domain/proof/layers/a1SignatureLayer"

import { getCertification } from "./adapters/supabase"
import { buildExplanation } from "./explanation"
import {
  computeScore,
  getTrustLevel,
  getVerificationStatus
} from "./score"
import { validateCrossLayerConsistency } from "./validation/crossLayer"
import { pool } from "@/lib/db"

type LocalFailureReason =
  | "ICP_FAIL"
  | "MERKLE_FAIL"
  | "BLOCKCHAIN_FAIL"
  | "INVALID_SIGNATURE"
  | "SIGNATURE_MISSING"
  | "PROOF_PAYLOAD_HASH_MISSING"
  | "CERTIFICATE_SUBJECT_MISSING"
  | "CERTIFICATE_ISSUER_MISSING"
  | "CERTIFICATE_EXPIRED"
  | "CHAIN_INVALID"
  | "CERT_REVOKED"
  | "HASH_MISMATCH"
  | "PROOF_NOT_FOUND"
  | "INVALID_INPUT"
  | "INVALID_MERKLE_ROOT"
  | "INVALID_MERKLE_PROOF"
  | "INVALID_BLOCKCHAIN_TX"
  | "RPC_UNAVAILABLE"
  | "LAYER_TIMEOUT"

const EXECUTABLE_LAYERS = [
  "icp",
  "merkle",
  "blockchain",
  "timestamp"
] as const satisfies readonly LayerName[]

const VALID_FAILURE_REASONS: readonly LocalFailureReason[] = [
  "ICP_FAIL",
  "MERKLE_FAIL",
  "BLOCKCHAIN_FAIL",
  "INVALID_SIGNATURE",
  "SIGNATURE_MISSING",
  "PROOF_PAYLOAD_HASH_MISSING",
  "CERTIFICATE_SUBJECT_MISSING",
  "CERTIFICATE_ISSUER_MISSING",
  "CERTIFICATE_EXPIRED",
  "CHAIN_INVALID",
  "CERT_REVOKED",
  "HASH_MISMATCH",
  "PROOF_NOT_FOUND",
  "INVALID_INPUT",
  "INVALID_MERKLE_ROOT",
  "INVALID_MERKLE_PROOF",
  "INVALID_BLOCKCHAIN_TX",
  "RPC_UNAVAILABLE",
  "LAYER_TIMEOUT"
]

function isFailureReason(value: unknown): value is LocalFailureReason {
  return (
    typeof value === "string" &&
    VALID_FAILURE_REASONS.includes(value as LocalFailureReason)
  )
}

function toFailureReasons(values: unknown[]): LocalFailureReason[] {
  return values.filter(isFailureReason)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

function normalizeHash(value: string): string {
  return value.trim().toLowerCase().replace(/^0x/, "")
}

function isValidHash(hash: string): boolean {
  return /^[a-f0-9]{64}$/i.test(hash)
}

function normalizeInput(input: ProofInput): ProofInput {
  return {
    hash: normalizeHash(input.hash),
    entity_id: String(input.entity_id).trim(),
    entity_type: input.entity_type,
    payload: input.payload
  }
}

function getDefaultLayerFailureReason(name: LayerName): LocalFailureReason {
  switch (name) {
    case "icp":
      return "ICP_FAIL"
    case "merkle":
      return "MERKLE_FAIL"
    case "blockchain":
      return "BLOCKCHAIN_FAIL"
    default:
      return "LAYER_TIMEOUT"
  }
}

function getDefaultLayerWeight(name: LayerName): number {
  switch (name) {
    case "icp":
      return 40
    case "merkle":
      return 30
    case "blockchain":
      return 30
    default:
      return 10
  }
}

function isValidEngineInput(
  input: ProofInput | null | undefined
): input is ProofInput {
  if (!input) return false
  if (!isValidHash(normalizeHash(input.hash))) return false
  if (!String(input.entity_id ?? "").trim()) return false
  return true
}

function normalizeLayer(layer: unknown, fallbackName: LayerName): LayerResult {
  if (!isRecord(layer)) {
    return {
      name: fallbackName,
      valid: false,
      weight: getDefaultLayerWeight(fallbackName),
      reasons: [getDefaultLayerFailureReason(fallbackName)],
      message: "Invalid layer result",
      error: "INVALID_LAYER_RESULT",
      details: null,
      duration_ms: null,
      meta: {}
    } as LayerResult
  }

  return {
    name: fallbackName,
    valid: layer.valid === true,
    weight: getDefaultLayerWeight(fallbackName),
    reasons: Array.isArray(layer.reasons)
      ? toFailureReasons(layer.reasons)
      : [],
    message: typeof layer.message === "string" ? layer.message : null,
    error: typeof layer.error === "string" ? layer.error : null,
    details: isRecord(layer.details) ? layer.details : null,
    duration_ms:
      typeof layer.duration_ms === "number" && Number.isFinite(layer.duration_ms)
        ? layer.duration_ms
        : null,
    meta: isRecord(layer.meta) ? layer.meta : {}
  } as LayerResult
}

async function safeLayer(
  name: LayerName,
  runner: () => Promise<LayerResult>
): Promise<LayerResult> {
  try {
    const result = await runner()
    return normalizeLayer(result, name)
  } catch (error) {
    return {
      name,
      valid: false,
      weight: getDefaultLayerWeight(name),
      reasons: [getDefaultLayerFailureReason(name)],
      message: "Layer failed",
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
      details: null,
      duration_ms: null,
      meta: {}
    } as LayerResult
  }
}

function buildSafeExplanation(input: {
  status: "VERIFIED" | "WARNING" | "FAILED"
  score: number
  reasons: LocalFailureReason[]
  layers: LayerResult[]
}) {
  return buildExplanation({
    status: input.status,
    score: input.score,
    reasons: input.reasons as unknown as Parameters<typeof buildExplanation>[0]["reasons"],
    layers: input.layers
  })
}

function createLayerTask(
  layerName: LayerName,
  ctx: ProofContext
): Promise<LayerResult> {
  switch (layerName) {
    case "icp":
      return safeLayer("icp", async () => {
        const cert = ctx.cert as Record<string, unknown>
        return (await a1SignatureLayer({
          event_hash: String(cert.content_hash ?? ""),
          signature: String(cert.signature ?? ""),
          signature_algorithm: String(cert.signature_algorithm ?? ""),
          signature_encoding: "base64",
          proof_payload_hash: String(cert.proof_payload_hash ?? ""),
          certificate_subject: String(cert.certificate_subject ?? ""),
          certificate_issuer: String(cert.certificate_issuer ?? ""),
          certificate_serial_number: String(cert.certificate_serial_number ?? ""),
          certificate_fingerprint: String(cert.certificate_fingerprint ?? ""),
          certificate_valid_to: String(cert.certificate_valid_to ?? ""),
          certificate_days_remaining: Number(cert.certificate_days_remaining ?? 0)
        })) as LayerResult
      })

    case "merkle":
      return safeLayer("merkle", () => merkleLayer(ctx))

    case "blockchain":
      return safeLayer("blockchain", () => blockchainLayer(ctx))

    case "timestamp":
      return safeLayer("timestamp", async () => {
        const cert = ctx.cert as any
        let hasTsa = Boolean(cert && cert.tsa_token)

        // Fallback: buscar tsa_token diretamente no banco se não veio no cert
        if (!hasTsa && cert?.content_hash) {
          try {
            const res = await pool.query(
              `SELECT tsa_token FROM public.certifications WHERE content_hash = $1 LIMIT 1`,
              [cert.content_hash]
            )
            hasTsa = Boolean(res.rows[0]?.tsa_token)
          } catch {}
        }

        return {
          name: "timestamp",
          valid: hasTsa,
          weight: 10,
          reasons: hasTsa ? [] : ["LAYER_TIMEOUT"],
          message: hasTsa ? "TSA RFC3161 valido" : "Sem TSA",
          error: hasTsa ? null : "LAYER_TIMEOUT",
          details: { tsa_present: hasTsa },
          duration_ms: 0,
          meta: { tsa_present: hasTsa }
        }
      })

    default:
      return safeLayer(layerName, async () =>
        ({
          name: layerName,
          valid: false,
          weight: 10,
          reasons: ["LAYER_TIMEOUT"],
          message: "Unknown layer",
          error: "UNKNOWN_LAYER",
          details: null,
          duration_ms: null,
          meta: {}
        }) as LayerResult
      )
  }
}

export async function runProofEngine(input: ProofInput | Record<string, unknown>): Promise<ProofResult> {
  const startedAt = Date.now()
  const requestId = randomUUID()

  if (!isValidEngineInput(input as ProofInput | null | undefined)) {
    const reasons: LocalFailureReason[] = ["INVALID_INPUT"]
    const layers: LayerResult[] = []

    return {
      valid: false,
      score: 0,
      trust: "LOW",
      status: "FAILED",
      reasons,
      layers,
      explanation: buildSafeExplanation({ status: "FAILED", score: 0, reasons, layers }),
      meta: { request_id: requestId }
    } as unknown as ProofResult
  }

  const normalizedInput = normalizeInput(input as ProofInput)
  const cert = await getCertification(normalizedInput)

  if (!cert) {
    const reasons: LocalFailureReason[] = ["PROOF_NOT_FOUND"]
    const layers: LayerResult[] = []

    return {
      valid: false,
      score: 0,
      trust: "LOW",
      status: "FAILED",
      reasons,
      layers,
      explanation: buildSafeExplanation({ status: "FAILED", score: 0, reasons, layers }),
      meta: { request_id: requestId }
    } as unknown as ProofResult
  }

  const ctx: ProofContext = {
    input: normalizedInput,
    cert,
    started_at: startedAt,
    request_id: requestId
  }

  const layers = await Promise.all(
    EXECUTABLE_LAYERS.map((layer) => createLayerTask(layer, ctx))
  )

  const reasons = toFailureReasons(
    layers.flatMap((layer) => layer.reasons ?? [])
  )

  const score = computeScore(layers, reasons as unknown as Parameters<typeof computeScore>[1])
  const trust = getTrustLevel(score)
  const status = getVerificationStatus(score)
  const crossLayer = validateCrossLayerConsistency(layers)

  return {
    valid: status !== "FAILED" && crossLayer.consistent,
    score,
    trust,
    status,
    reasons,
    layers,
    explanation: buildSafeExplanation({ status, score, reasons, layers }),
    meta: {
      request_id: requestId,
      execution_ms: Date.now() - startedAt
    }
  } as unknown as ProofResult
}

export default runProofEngine
