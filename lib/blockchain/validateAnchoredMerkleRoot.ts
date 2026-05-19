import { ethers } from "ethers"

export type VerifyAnchoredRootInput = {
  txHash?: string | null
  expectedRoot?: string | null
  rpcUrl?: string | null
  minConfirmations?: number
}

export type VerifyAnchoredRootResult = {
  checked: boolean
  anchored: boolean
  valid: boolean
  tx_hash: string | null
  block_number: number | null
  confirmations: number
  expected_root: string | null
  root_found_in_tx: boolean
  error: string | null
}

function normalizeHex(value?: string | null): string | null {
  if (!value) return null

  const clean = value.trim().toLowerCase()
  return clean.startsWith("0x") ? clean : `0x${clean}`
}

function isTxHash(value?: string | null): value is string {
  return typeof value === "string" && /^0x[a-f0-9]{64}$/i.test(value)
}

function isRoot(value?: string | null): value is string {
  return typeof value === "string" && /^0x[a-f0-9]{64}$/i.test(value)
}

export async function verifyAnchoredRoot(
  input: VerifyAnchoredRootInput
): Promise<VerifyAnchoredRootResult> {
  const txHash = normalizeHex(input.txHash)
  const expectedRoot = normalizeHex(input.expectedRoot)
  const rpcUrl = input.rpcUrl ?? process.env.POLYGON_RPC ?? null
  const minConfirmations = input.minConfirmations ?? 1

  const base: VerifyAnchoredRootResult = {
    checked: false,
    anchored: false,
    valid: false,
    tx_hash: txHash,
    block_number: null,
    confirmations: 0,
    expected_root: expectedRoot,
    root_found_in_tx: false,
    error: null
  }

  if (!isTxHash(txHash)) {
    return { ...base, error: "INVALID_TX_HASH" }
  }

  if (!isRoot(expectedRoot)) {
    return { ...base, error: "INVALID_EXPECTED_ROOT" }
  }

  if (!rpcUrl) {
    return { ...base, error: "POLYGON_RPC_NOT_CONFIGURED" }
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const tx = await provider.getTransaction(txHash)

    if (!tx) {
      return { ...base, checked: true, error: "TX_NOT_FOUND" }
    }

    const receipt = await provider.getTransactionReceipt(txHash)

    if (!receipt?.blockNumber) {
      return { ...base, checked: true, error: "TX_NOT_MINED" }
    }

    const currentBlock = await provider.getBlockNumber()
    const confirmations = Math.max(0, currentBlock - receipt.blockNumber + 1)

    const txData = tx.data?.toLowerCase() ?? ""
    const rootNoPrefix = expectedRoot.replace(/^0x/, "")
    const rootFound = txData.includes(rootNoPrefix)
    const anchored = confirmations >= minConfirmations && rootFound

    return {
      checked: true,
      anchored,
      valid: anchored,
      tx_hash: txHash,
      block_number: receipt.blockNumber,
      confirmations,
      expected_root: expectedRoot,
      root_found_in_tx: rootFound,
      error: rootFound ? null : "ROOT_NOT_FOUND_IN_TX"
    }
  } catch (error) {
    return {
      ...base,
      checked: true,
      error: error instanceof Error ? error.message : "BLOCKCHAIN_VERIFY_FAILED"
    }
  }
}

export const validateAnchoredMerkleRoot = verifyAnchoredRoot