import type { FailureReason, LayerResult } from "../types"

/* =========================
   TYPES
========================= */

export type CrossLayerIssueCode =
  | "ICP_MISSING"
  | "MERKLE_MISSING"
  | "BLOCKCHAIN_MISSING"
  | "HASH_IDENTITY_MISMATCH"
  | "MERKLE_ROOT_MISMATCH"
  | "ANCHOR_MISMATCH"
  | "CHAIN_IDENTITY_MISMATCH"
  | "PARTIAL_PROOF_ONLY"

export type CrossLayerIssue = {
  code: CrossLayerIssueCode
  severity: "low" | "medium" | "high"
  message: string
}

export type CrossLayerValidationResult = {
  valid: boolean
  consistent: boolean
  issues: CrossLayerIssue[]
  derived_reasons: FailureReason[]
  summary: string
}

/* =========================
   HELPERS
========================= */

function findLayer(
  layers: LayerResult[],
  name: "icp" | "merkle" | "blockchain"
): LayerResult | undefined {
  return layers.find((layer) => layer.name === name)
}

function normalizeHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return normalized || null
}

function getMetaValue(
  layer: LayerResult | undefined,
  key: string
): unknown {
  return layer?.meta?.[key]
}

function getMetaHash(
  layer: LayerResult | undefined,
  key: string
): string | null {
  return normalizeHash(getMetaValue(layer, key))
}

function getMetaBoolean(
  layer: LayerResult | undefined,
  key: string
): boolean | undefined {
  const value = getMetaValue(layer, key)
  return typeof value === "boolean" ? value : undefined
}

function uniqueReasons(reasons: FailureReason[]): FailureReason[] {
  return [...new Set(reasons)]
}

function buildSummary(
  consistent: boolean,
  issues: CrossLayerIssue[]
): string {
  if (consistent && issues.length === 0) {
    return "As camadas ICP, Merkle e Blockchain estão estruturalmente consistentes entre si."
  }

  const highSeverityCount = issues.filter(
    (issue) => issue.severity === "high"
  ).length

  if (highSeverityCount > 0) {
    return "Foram detectadas inconsistências críticas entre as camadas de prova."
  }

  return "Foram detectadas inconsistências parciais entre as camadas de prova."
}

function hasIssue(
  issues: CrossLayerIssue[],
  code: CrossLayerIssueCode
): boolean {
  return issues.some((issue) => issue.code === code)
}

function pushIssue(
  issues: CrossLayerIssue[],
  derivedReasons: FailureReason[],
  issue: CrossLayerIssue,
  reason?: FailureReason
): void {
  if (!hasIssue(issues, issue.code)) {
    issues.push(issue)
  }

  if (reason) {
    derivedReasons.push(reason)
  }
}

/* =========================
   PUBLIC API
========================= */

export function validateCrossLayerConsistency(
  layers: LayerResult[]
): CrossLayerValidationResult {
  const issues: CrossLayerIssue[] = []
  const derivedReasons: FailureReason[] = []

  const icp = findLayer(layers, "icp")
  const merkle = findLayer(layers, "merkle")
  const blockchain = findLayer(layers, "blockchain")

  if (!icp) {
    pushIssue(
      issues,
      derivedReasons,
      {
        code: "ICP_MISSING",
        severity: "medium",
        message: "A camada ICP não foi executada ou não está disponível."
      },
      "ICP_FAIL"
    )
  }

  if (!merkle) {
    pushIssue(
      issues,
      derivedReasons,
      {
        code: "MERKLE_MISSING",
        severity: "medium",
        message: "A camada Merkle não foi executada ou não está disponível."
      },
      "MERKLE_FAIL"
    )
  }

  if (!blockchain) {
    pushIssue(
      issues,
      derivedReasons,
      {
        code: "BLOCKCHAIN_MISSING",
        severity: "medium",
        message: "A camada Blockchain não foi executada ou não está disponível."
      },
      "BLOCKCHAIN_FAIL"
    )
  }

  const icpHash =
    getMetaHash(icp, "certified_hash") ??
    getMetaHash(icp, "input_hash")

  const merkleHash =
    getMetaHash(merkle, "certification_hash") ??
    getMetaHash(merkle, "input_hash")

  const icpHashMatch = getMetaBoolean(icp, "hash_match")
  const merkleHashMatch = getMetaBoolean(merkle, "hash_match")

  if (
    (icpHash && merkleHash && icpHash !== merkleHash) ||
    icpHashMatch === false ||
    merkleHashMatch === false
  ) {
    pushIssue(
      issues,
      derivedReasons,
      {
        code: "HASH_IDENTITY_MISMATCH",
        severity: "high",
        message: "O hash observado nas camadas ICP e Merkle não é estruturalmente consistente."
      },
      "HASH_MISMATCH"
    )
  }

  const icpEntityIdMatch = getMetaBoolean(icp, "entity_id_match")
  const icpEntityTypeMatch = getMetaBoolean(icp, "entity_type_match")

  if (icp && (icpEntityIdMatch === false || icpEntityTypeMatch === false)) {
    pushIssue(
      issues,
      derivedReasons,
      {
        code: "CHAIN_IDENTITY_MISMATCH",
        severity: "high",
        message: "A identidade da entidade certificada diverge da identidade consultada."
      },
      "CHAIN_INVALID"
    )
  }

  const merkleRoot = getMetaHash(merkle, "merkle_root")
  const computedRoot = getMetaHash(merkle, "computed_root")
  const rootMatch = getMetaBoolean(merkle, "root_match")
  const merkleRootValid = getMetaBoolean(merkle, "merkle_root_valid")

  if (
    (merkleRoot && computedRoot && merkleRoot !== computedRoot) ||
    rootMatch === false ||
    merkleRootValid === false
  ) {
    pushIssue(
      issues,
      derivedReasons,
      {
        code: "MERKLE_ROOT_MISMATCH",
        severity: "high",
        message: "A Merkle root calculada diverge da Merkle root certificada."
      },
      "INVALID_MERKLE_ROOT"
    )
  }

  const blockchainExpectedRoot =
    getMetaHash(blockchain, "merkle_root_expected") ??
    getMetaHash(blockchain, "merkle_root")

  const blockchainMerkleMatch = getMetaBoolean(blockchain, "merkle_match")
  const blockchainAnchored = getMetaBoolean(blockchain, "anchored")

  if (
    (merkleRoot &&
      blockchainExpectedRoot &&
      merkleRoot !== blockchainExpectedRoot) ||
    blockchainMerkleMatch === false
  ) {
    pushIssue(
      issues,
      derivedReasons,
      {
        code: "ANCHOR_MISMATCH",
        severity: "high",
        message: "A root esperada pela camada Blockchain diverge da root da camada Merkle."
      },
      "BLOCKCHAIN_FAIL"
    )
  }

  if (blockchain && blockchainAnchored === false && blockchain.valid === true) {
    pushIssue(
      issues,
      derivedReasons,
      {
        code: "ANCHOR_MISMATCH",
        severity: "high",
        message: "A camada Blockchain foi executada, mas a evidência de ancoragem não está consistente."
      },
      "BLOCKCHAIN_FAIL"
    )
  }

  const merkleValid = merkle?.valid === true
  const blockchainValid = blockchain?.valid === true
  const icpValid = icp?.valid === true

  const validCount = [icpValid, merkleValid, blockchainValid].filter(Boolean).length
  const presentCount = [icp, merkle, blockchain].filter(Boolean).length

  if (
    presentCount > 0 &&
    validCount > 0 &&
    validCount < 3
  ) {
    pushIssue(
      issues,
      derivedReasons,
      {
        code: "PARTIAL_PROOF_ONLY",
        severity: "medium",
        message: "Existe prova parcial válida, mas o conjunto completo das camadas não está íntegro."
      }
    )
  }

  const consistent =
    issues.filter((issue) => issue.severity === "high").length === 0

  const valid =
    consistent &&
    presentCount === 3 &&
    validCount === 3

  return {
    valid,
    consistent,
    issues,
    derived_reasons: uniqueReasons(derivedReasons),
    summary: buildSummary(consistent, issues)
  }
}