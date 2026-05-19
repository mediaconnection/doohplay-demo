import type {
  FailureReason,
  LayerName,
  LayerResult,
  PenaltyBreakdownItem,
  ScoreBreakdownItem,
  ScoreComputation,
  ScoreLabel,
  TrustLevel,
  VerificationStatus
} from "./types"

/* =========================
   CONFIG
========================= */

const DEFAULT_LAYER_WEIGHT = 10
const CRITICAL_FAILURE_MAX_SCORE = 35
const VERIFIED_MIN_SCORE = 80
const WARNING_MIN_SCORE = 50

const LAYER_WEIGHTS: Partial<Record<LayerName, number>> = {
  icp: 40,
  merkle: 30,
  blockchain: 30,
  signature: 40,
  chain: 20,
  timestamp: 10,
  certificate: 20
}

const REASON_PENALTIES: Record<FailureReason, number> = {
  ICP_FAIL: 25,
  MERKLE_FAIL: 30,
  BLOCKCHAIN_FAIL: 20,
  INVALID_SIGNATURE: 35,
  CHAIN_INVALID: 20,
  CERT_REVOKED: 40,
  CERT_EXPIRED: 20,
  HASH_MISMATCH: 50,
  PROOF_NOT_FOUND: 35,
  INVALID_INPUT: 100,
  INVALID_MERKLE_ROOT: 25,
  INVALID_MERKLE_PROOF: 25,
  INVALID_BLOCKCHAIN_TX: 20,
  RPC_UNAVAILABLE: 15,
  LAYER_TIMEOUT: 20
}

const CRITICAL_REASONS = new Set<FailureReason>([
  "CERT_REVOKED",
  "INVALID_SIGNATURE",
  "HASH_MISMATCH",
  "PROOF_NOT_FOUND",
  "INVALID_INPUT"
])

/* =========================
   HELPERS
========================= */

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value))
}

function isFailureReason(value: unknown): value is FailureReason {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(REASON_PENALTIES, value)
  )
}

function isLayerResult(value: unknown): value is LayerResult {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as LayerResult).name === "string" &&
    typeof (value as LayerResult).valid === "boolean"
  )
}

function getLayerWeight(layer: Pick<LayerResult, "name" | "weight">): number {
  if (typeof layer.weight === "number" && Number.isFinite(layer.weight)) {
    return clamp(Math.round(layer.weight), 0, 100)
  }

  return clamp(LAYER_WEIGHTS[layer.name] ?? DEFAULT_LAYER_WEIGHT, 0, 100)
}

function normalizeLayers(layers: unknown): LayerResult[] {
  if (!Array.isArray(layers)) return []

  return layers.filter(isLayerResult)
}

function normalizeReasons(reasons: unknown): FailureReason[] {
  if (!Array.isArray(reasons)) return []

  return [...new Set(reasons.filter(isFailureReason))]
}

function collectReasonsFromLayers(layers: LayerResult[]): FailureReason[] {
  const layerReasons = layers.flatMap((layer) => {
    if (Array.isArray(layer.reasons)) {
      return normalizeReasons(layer.reasons)
    }

    const metaReasons = layer.meta?.reasons
    return Array.isArray(metaReasons) ? normalizeReasons(metaReasons) : []
  })

  return normalizeReasons(layerReasons)
}

function scoreFromLayers(layers: LayerResult[]): {
  score: number
  breakdown: ScoreBreakdownItem[]
} {
  const breakdown: ScoreBreakdownItem[] = layers.map((layer) => {
    const weight = getLayerWeight(layer)

    return {
      layer: layer.name,
      valid: layer.valid,
      weight,
      contribution: layer.valid ? weight : 0
    }
  })

  const score = breakdown.reduce((acc, item) => acc + item.contribution, 0)

  return { score, breakdown }
}

function penaltyFromReasons(reasons: FailureReason[]): {
  penalty: number
  breakdown: PenaltyBreakdownItem[]
} {
  const breakdown: PenaltyBreakdownItem[] = reasons.map((reason) => ({
    reason,
    penalty: REASON_PENALTIES[reason] ?? 0
  }))

  const penalty = breakdown.reduce((acc, item) => acc + item.penalty, 0)

  return { penalty, breakdown }
}

function hasCriticalFailure(reasons: FailureReason[]): boolean {
  return reasons.some((reason) => CRITICAL_REASONS.has(reason))
}

function mergeReasons(
  layers: LayerResult[],
  reasons: FailureReason[]
): FailureReason[] {
  return normalizeReasons([
    ...reasons,
    ...collectReasonsFromLayers(layers)
  ])
}

function computeInternal(
  layers: LayerResult[],
  reasons: FailureReason[]
): {
  finalScore: number
  trust: TrustLevel
  breakdown: ScoreBreakdownItem[]
  penalties: PenaltyBreakdownItem[]
} {
  const safeLayers = normalizeLayers(layers)
  const mergedReasons = mergeReasons(safeLayers, reasons)

  const {
    score: baseScore,
    breakdown
  } = scoreFromLayers(safeLayers)

  const {
    penalty: totalPenalty,
    breakdown: penalties
  } = penaltyFromReasons(mergedReasons)

  let finalScore = baseScore - totalPenalty

  if (hasCriticalFailure(mergedReasons)) {
    finalScore = Math.min(finalScore, CRITICAL_FAILURE_MAX_SCORE)
  }

  finalScore = clamp(Math.round(finalScore))

  return {
    finalScore,
    trust: getTrustLevel(finalScore),
    breakdown,
    penalties
  }
}

/* =========================
   STATUS / TRUST
========================= */

export function getScoreLabel(score: number): ScoreLabel {
  if (score >= VERIFIED_MIN_SCORE) return "High Trust"
  if (score >= WARNING_MIN_SCORE) return "Moderate Trust"
  return "Low Trust"
}

export function getTrustLevel(score: number): TrustLevel {
  if (score >= VERIFIED_MIN_SCORE) return "HIGH"
  if (score >= WARNING_MIN_SCORE) return "MEDIUM"
  return "LOW"
}

export function getVerificationStatus(score: number): VerificationStatus {
  if (score >= VERIFIED_MIN_SCORE) return "VERIFIED"
  if (score >= WARNING_MIN_SCORE) return "WARNING"
  return "FAILED"
}

/* =========================
   PUBLIC API
========================= */

export function computeScore(
  layers: LayerResult[],
  reasons: FailureReason[] = []
): number {
  return computeInternal(layers, normalizeReasons(reasons)).finalScore
}

export function getScoreBreakdown(
  layers: LayerResult[],
  reasons: FailureReason[] = []
): ScoreComputation {
  const normalizedReasons = normalizeReasons(reasons)
  const { finalScore, trust, breakdown, penalties } = computeInternal(
    layers,
    normalizedReasons
  )

  return {
    score: finalScore,
    trust,
    breakdown,
    penalties
  }
}