// @ts-nocheck
import { validateTransaction } from "@/lib/blockchain/validateTx"
import { decodeTransaction } from "@/lib/blockchain/decodeTx"

import { setLayerCache } from "../cache/layerCache"
import { keys } from "../cache/keys"
import type { FailureReason, LayerResult, ProofContext } from "../types"
import { getBlockchainConfig } from "../config"

const TTL_TX_SECONDS = 30
const TTL_TX_FAIL_SECONDS = 15
const BLOCKCHAIN_WEIGHT = 30

function normalizeHex(hex: string | null | undefined): string | null {
  if (typeof hex !== "string") return null
  const normalized = hex.trim().toLowerCase().replace(/^0x/, "")
  return normalized || null
}

function normalizeTxHash(hash: string | null | undefined): string | null {
  const normalized = normalizeHex(hash)
  return normalized ? `0x${normalized}` : null
}

function normalizeAddress(addr: string | null | undefined): string | null {
  if (typeof addr !== "string") return null
  return addr.trim().toLowerCase() || null
}

function isValidTxHash(hash: string | null | undefined): boolean {
  return typeof hash === "string" && /^0x[a-f0-9]{64}$/i.test(hash)
}

function uniqueReasons(reasons: FailureReason[]): FailureReason[] {
  return [...new Set(reasons)]
}

function safeDurationMs(value?: number): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined
}

function buildFailLayer(
  reasons: FailureReason[],
  meta: Record<string, unknown> = {},
  durationMs?: number
): LayerResult {
  const normalizedReasons = uniqueReasons(reasons)
  const safeDuration = safeDurationMs(durationMs)

  return {
    name: "blockchain",
    valid: false,
    weight: BLOCKCHAIN_WEIGHT,
    reasons: normalizedReasons,
    message: "Blockchain validation failed",
    error: normalizedReasons[0] ?? "BLOCKCHAIN_FAIL",
    details: null,
    duration_ms: safeDuration,
    meta: {
      reasons: normalizedReasons,
      anchored: false,
      blockchain_valid: false,
      duration_ms: safeDuration,
      ...meta
    }
  }
}

function getTxHashFromCert(ctx: ProofContext): string | null {
  const raw =
    typeof ctx.cert?.blockchain_tx === "string"
      ? ctx.cert.blockchain_tx
      : typeof ctx.cert?.tx_hash === "string"
        ? ctx.cert.tx_hash
        : null

  return normalizeTxHash(raw)
}

function getCacheKey(txHash: string): string {
  if (typeof keys.tx === "function") {
    try {
      return keys.tx(txHash)
    } catch {
      return `tx:${txHash}`
    }
  }

  return `tx:${txHash}`
}

function getExpectedMerkleRoot(ctx: ProofContext): string | null {
  return normalizeHex(
    typeof ctx.cert?.merkle_root === "string" ? ctx.cert.merkle_root : null
  )
}

function buildFailureMessage(reasons: FailureReason[]): string {
  if (reasons.includes("INVALID_BLOCKCHAIN_TX")) {
    return "Blockchain validation failed due to invalid transaction hash"
  }

  if (reasons.includes("RPC_UNAVAILABLE")) {
    return "Blockchain validation failed because the RPC is unavailable"
  }

  return "Blockchain validation failed"
}

export async function blockchainLayer(
  ctx: ProofContext
): Promise<LayerResult> {
  const startedAt = Date.now()
  const config = getBlockchainConfig()

  try {
    if (!ctx.cert) {
      return buildFailLayer(
        ["PROOF_NOT_FOUND"],
        {
          detail: "Certification record not found",
          certification_found: false
        },
        Date.now() - startedAt
      )
    }

    const txHash = getTxHashFromCert(ctx)

    if (!txHash) {
      return buildFailLayer(
        ["BLOCKCHAIN_FAIL"],
        {
          detail: "Missing blockchain transaction hash",
          certification_found: true,
          tx_hash: null,
          tx_hash_format_valid: false
        },
        Date.now() - startedAt
      )
    }

    if (!isValidTxHash(txHash)) {
      const failed = buildFailLayer(
        ["INVALID_BLOCKCHAIN_TX"],
        {
          detail: "Invalid transaction hash format",
          tx_hash: txHash,
          tx_hash_format_valid: false,
          certification_found: true
        },
        Date.now() - startedAt
      )

      await setLayerCache(getCacheKey(txHash), failed, TTL_TX_FAIL_SECONDS)
      return failed
    }

    const cacheKey = getCacheKey(txHash)

    let tx: Awaited<ReturnType<typeof validateTransaction>>

    try {
      tx = await validateTransaction(txHash)
    } catch (error) {
      const failed = buildFailLayer(
        ["RPC_UNAVAILABLE"],
        {
          detail: "Blockchain RPC unavailable or transaction lookup failed",
          tx_hash: txHash,
          tx_hash_format_valid: true,
          error: error instanceof Error ? error.message : "UNKNOWN_ERROR"
        },
        Date.now() - startedAt
      )

      await setLayerCache(cacheKey, failed, TTL_TX_FAIL_SECONDS)
      return failed
    }

    if (!tx) {
      const failed = buildFailLayer(
        ["BLOCKCHAIN_FAIL"],
        {
          detail: "Transaction lookup returned no result",
          tx_hash: txHash,
          tx_hash_format_valid: true
        },
        Date.now() - startedAt
      )

      await setLayerCache(cacheKey, failed, TTL_TX_FAIL_SECONDS)
      return failed
    }

    if (tx.status === "pending") {
      const failed = buildFailLayer(
        ["BLOCKCHAIN_FAIL"],
        {
          detail: "Transaction is still pending",
          tx_hash: txHash,
          tx_hash_format_valid: true,
          tx_status: tx.status,
          tx
        },
        Date.now() - startedAt
      )

      await setLayerCache(cacheKey, failed, TTL_TX_FAIL_SECONDS)
      return failed
    }

    if (!tx.valid) {
      const failed = buildFailLayer(
        ["BLOCKCHAIN_FAIL"],
        {
          detail: "Transaction validation failed",
          tx_hash: txHash,
          tx_hash_format_valid: true,
          tx_status: tx.status,
          tx
        },
        Date.now() - startedAt
      )

      await setLayerCache(cacheKey, failed, TTL_TX_FAIL_SECONDS)
      return failed
    }

    let methodMatch = true
    let merkleMatch = true
    let decodedName: string | null = null
    let decodedArgs: unknown[] | null = null
    let decodedRoot: string | null = null
    let decodeErrorMessage: string | null = null

    const shouldDecode =
      typeof tx.rawData === "string" &&
      tx.rawData.trim().length > 0 &&
      Array.isArray(config.allowedMethods) &&
      config.allowedMethods.length > 0

    if (shouldDecode) {
      const decoded = tx.rawData ? decodeTransaction(tx.rawData) : null

      decodedName = decoded?.name ?? null
      decodedArgs = Array.isArray(decoded?.args) ? decoded.args : null
      decodedRoot =
        typeof decoded?.root === "string" ? normalizeHex(decoded.root) : null
      decodeErrorMessage = decoded?.error ?? null

      if (!decodedName || decodedName === "unknown") {
        methodMatch = false
      } else {
        methodMatch = config.allowedMethods.includes(decodedName as never)
      }

      const expectedMerkle = getExpectedMerkleRoot(ctx)

      if (expectedMerkle) {
        merkleMatch = decodedRoot === expectedMerkle
      }

      if (decodeErrorMessage) {
        methodMatch = false
        merkleMatch = false
      }
    }

    const configuredContract = normalizeAddress(config.contractAddress)
    const targetContract = normalizeAddress(
      typeof tx.to === "string" ? tx.to : null
    )

    const contractMatch =
      !configuredContract || configuredContract === targetContract

    const confirmations =
      typeof tx.confirmations === "number" && Number.isFinite(tx.confirmations)
        ? tx.confirmations
        : 0

    const confirmationsRequired =
      typeof config.minConfirmations === "number" &&
      Number.isFinite(config.minConfirmations)
        ? config.minConfirmations
        : 0

    const confirmationsOk = confirmations >= confirmationsRequired
    const txAnchored = tx.valid === true && tx.status === "success"

    const reasons: FailureReason[] = []

    if (!confirmationsOk) reasons.push("BLOCKCHAIN_FAIL")
    if (!contractMatch) reasons.push("BLOCKCHAIN_FAIL")
    if (!methodMatch) reasons.push("BLOCKCHAIN_FAIL")
    if (!merkleMatch) reasons.push("BLOCKCHAIN_FAIL")
    if (decodeErrorMessage) reasons.push("BLOCKCHAIN_FAIL")

    const finalReasons = uniqueReasons(reasons)
    const durationMs = Date.now() - startedAt
    const valid = finalReasons.length === 0

    const layer: LayerResult = {
      name: "blockchain",
      valid,
      weight: BLOCKCHAIN_WEIGHT,
      reasons: finalReasons,
      message: valid
        ? "Blockchain layer validated successfully"
        : buildFailureMessage(finalReasons),
      error: finalReasons.length > 0 ? finalReasons[0] : null,
      details: null,
      duration_ms: durationMs,
      meta: {
        reasons: finalReasons,
        detail: valid
          ? "Blockchain layer validated successfully"
          : buildFailureMessage(finalReasons),

        tx_hash: txHash,
        tx_hash_format_valid: true,
        tx_status: tx.status,

        confirmations,
        confirmations_required: confirmationsRequired,
        confirmations_ok: confirmationsOk,

        contract_address: targetContract,
        expected_contract_address: configuredContract,
        contract_match: contractMatch,

        method: decodedName,
        allowed_methods: Array.isArray(config.allowedMethods)
          ? [...config.allowedMethods]
          : [],
        method_match: methodMatch,

        raw_data_present:
          typeof tx.rawData === "string" && tx.rawData.trim().length > 0,

        merkle_root_expected:
          typeof ctx.cert.merkle_root === "string"
            ? ctx.cert.merkle_root
            : null,
        decoded_root: decodedRoot,
        merkle_match: merkleMatch,

        decoded_args: decodedArgs,
        decode_error: decodeErrorMessage,

        anchored: txAnchored,
        blockchain_valid: valid,

        network: tx.network ?? null,
        rpc_url: "rpc_url" in tx ? tx.rpc_url : null,

        from: typeof tx.from === "string" ? tx.from : null,
        to: typeof tx.to === "string" ? tx.to : null,
        gas_used: typeof tx.gasUsed === "string" ? tx.gasUsed : null,
        block_number:
          typeof tx.blockNumber === "number" ? tx.blockNumber : null,
        block_timestamp:
          typeof tx.timestamp === "number" ? tx.timestamp : null,

        duration_ms: durationMs,
        tx
      }
    }

    await setLayerCache(
      cacheKey,
      layer,
      layer.valid && tx.status === "success" && confirmationsOk
        ? TTL_TX_SECONDS
        : TTL_TX_FAIL_SECONDS
    )

    return layer
  } catch (error: unknown) {
    return buildFailLayer(
      ["BLOCKCHAIN_FAIL"],
      {
        detail: "Unexpected error during blockchain layer execution",
        error: error instanceof Error ? error.message : "BLOCKCHAIN_ERROR"
      },
      Date.now() - startedAt
    )
  }
}
