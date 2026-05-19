import { ethers } from "ethers"

/* =========================
   TYPES
========================= */

export type BlockchainVerifyInput = {
  tx_hash?: string | null
  merkle_root?: string | null
  network?: string | null
  expected_contract?: string | null
}

export type BlockchainVerifyResult = {
  anchored: boolean
  valid: boolean
  tx_hash?: string
  network?: string
  block_number?: number
  confirmations?: number
  contract_match?: boolean | null
  merkle_root_match?: boolean | null
  reason?: string
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

function with0x(value?: string | null): string {
  const clean = normalizeHash(value)
  return clean ? `0x${clean}` : ""
}

function isTxHash(value?: string | null): boolean {
  return /^0x[a-f0-9]{64}$/i.test(with0x(value))
}

function isAddress(value?: string | null): boolean {
  return !!value && ethers.isAddress(value)
}

function getPolygonRpc(): string {
  return (
    process.env.POLYGON_RPC ||
    "https://polygon-rpc.com"
  )
}

/* =========================
   VERIFY
========================= */

export async function verifyBlockchainAnchor(
  input: BlockchainVerifyInput
): Promise<BlockchainVerifyResult> {
  const txHash = with0x(input.tx_hash)
  const expectedRoot = normalizeHash(input.merkle_root)
  const expectedContract = input.expected_contract?.trim()

  if (!isTxHash(txHash)) {
    return {
      anchored: false,
      valid: false,
      reason: "INVALID_TX_HASH"
    }
  }

  try {
    const provider = new ethers.JsonRpcProvider(getPolygonRpc())

    const tx = await provider.getTransaction(txHash)
    if (!tx) {
      return {
        anchored: false,
        valid: false,
        tx_hash: txHash,
        network: input.network || "polygon",
        reason: "TX_NOT_FOUND"
      }
    }

    const receipt = await provider.getTransactionReceipt(txHash)
    if (!receipt || receipt.status !== 1) {
      return {
        anchored: false,
        valid: false,
        tx_hash: txHash,
        network: input.network || "polygon",
        reason: "TX_NOT_CONFIRMED"
      }
    }

    const latestBlock = await provider.getBlockNumber()

    const contractMatch =
      isAddress(expectedContract)
        ? normalizeHash(tx.to) === normalizeHash(expectedContract)
        : null

    let merkleRootMatch: boolean | null = null

    if (expectedRoot && tx.data) {
      merkleRootMatch = tx.data.toLowerCase().includes(expectedRoot)
    }

    const valid =
      receipt.status === 1 &&
      (contractMatch !== false) &&
      (merkleRootMatch !== false)

    return {
      anchored: true,
      valid,
      tx_hash: txHash,
      network: input.network || "polygon",
      block_number: receipt.blockNumber,
      confirmations: Math.max(0, latestBlock - receipt.blockNumber),
      contract_match: contractMatch,
      merkle_root_match: merkleRootMatch,
      reason: valid ? undefined : "BLOCKCHAIN_ANCHOR_MISMATCH"
    }
  } catch (err) {
    return {
      anchored: false,
      valid: false,
      tx_hash: txHash,
      network: input.network || "polygon",
      reason:
        err instanceof Error
          ? `BLOCKCHAIN_VERIFY_ERROR: ${err.message}`
          : "BLOCKCHAIN_VERIFY_ERROR"
    }
  }
}