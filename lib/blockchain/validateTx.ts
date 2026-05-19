import { JsonRpcProvider } from "ethers"

import { blockchainEnv } from "@/lib/config/env"

const RPC_TIMEOUT_MS = Number(process.env.BLOCKCHAIN_RPC_TIMEOUT_MS ?? 8_000)

const POLYGON_MAINNET_CHAIN_ID = BigInt(137)
const POLYGON_AMOY_CHAIN_ID = BigInt(80002)

const RPCS = [
  blockchainEnv.rpc,
  process.env.POLYGON_RPC,
  blockchainEnv.rpcFallback1,
  blockchainEnv.rpcFallback2
]
  .filter((value): value is string => {
    return typeof value === "string" && value.trim().length > 0
  })
  .map((value) => value.trim())
  .filter((value, index, array) => array.indexOf(value) === index)

let cachedProvider: JsonRpcProvider | null = null
let cachedProviderUrl: string | null = null

export type TxValidationResult = {
  valid: boolean
  confirmations: number
  status: "success" | "failed" | "pending"
  blockNumber?: number
  timestamp?: number
  gasUsed?: string
  rawData?: string | null
  from?: string | null
  to?: string | null
  network?: string | null
  error?: string | null
  rpc_url?: string | null
}

function normalizeTxHash(hash: string): string {
  return hash.trim().toLowerCase()
}

function isValidTxHash(hash: string): boolean {
  return /^0x[a-f0-9]{64}$/.test(hash)
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs)
  })

  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

async function testProvider(provider: JsonRpcProvider): Promise<void> {
  await withTimeout(provider.getBlockNumber(), RPC_TIMEOUT_MS, "RPC_TIMEOUT")
}

async function createWorkingProvider(): Promise<{
  provider: JsonRpcProvider
  url: string
}> {
  for (const url of RPCS) {
    try {
      const provider = new JsonRpcProvider(url, undefined, {
        staticNetwork: false
      })

      await testProvider(provider)

      return { provider, url }
    } catch (error) {
      console.warn("RPC_PROVIDER_FAILED", {
        url,
        error: error instanceof Error ? error.message : "UNKNOWN_ERROR"
      })
    }
  }

  throw new Error("ALL_RPCS_FAILED")
}

async function getProvider(): Promise<JsonRpcProvider> {
  if (cachedProvider) {
    try {
      await testProvider(cachedProvider)
      return cachedProvider
    } catch {
      cachedProvider = null
      cachedProviderUrl = null
    }
  }

  const { provider, url } = await createWorkingProvider()

  cachedProvider = provider
  cachedProviderUrl = url

  return provider
}

function getConfirmations(
  currentBlock: number,
  receiptBlockNumber: number
): number {
  if (!Number.isFinite(currentBlock) || !Number.isFinite(receiptBlockNumber)) {
    return 0
  }

  if (currentBlock < receiptBlockNumber) {
    return 0
  }

  return Math.max(0, currentBlock - receiptBlockNumber + 1)
}

function getNetworkName(chainId?: bigint): string {
  if (chainId === POLYGON_MAINNET_CHAIN_ID) return "polygon"
  if (chainId === POLYGON_AMOY_CHAIN_ID) return "polygon-amoy"

  return "polygon"
}

export async function validateTransaction(
  txHash: string
): Promise<TxValidationResult> {
  try {
    const normalizedHash = normalizeTxHash(txHash)

    if (!normalizedHash || !isValidTxHash(normalizedHash)) {
      return {
        valid: false,
        confirmations: 0,
        status: "failed",
        network: "polygon",
        rpc_url: cachedProviderUrl,
        error: "INVALID_TX_HASH"
      }
    }

    const provider = await getProvider()

    const [receipt, tx, network] = await Promise.all([
      withTimeout(
        provider.getTransactionReceipt(normalizedHash),
        RPC_TIMEOUT_MS,
        "RPC_RECEIPT_TIMEOUT"
      ),
      withTimeout(
        provider.getTransaction(normalizedHash),
        RPC_TIMEOUT_MS,
        "RPC_TX_TIMEOUT"
      ),
      withTimeout(provider.getNetwork(), RPC_TIMEOUT_MS, "RPC_NETWORK_TIMEOUT")
    ])

    const networkName = getNetworkName(network?.chainId)

    if (!receipt) {
      return {
        valid: false,
        confirmations: 0,
        status: "pending",
        rawData: tx?.data ?? null,
        from: tx?.from ?? null,
        to: tx?.to ?? null,
        network: networkName,
        rpc_url: cachedProviderUrl,
        error: null
      }
    }

    const [currentBlock, block] = await Promise.all([
      withTimeout(
        provider.getBlockNumber(),
        RPC_TIMEOUT_MS,
        "RPC_BLOCKNUMBER_TIMEOUT"
      ),
      withTimeout(
        provider.getBlock(receipt.blockNumber),
        RPC_TIMEOUT_MS,
        "RPC_BLOCK_TIMEOUT"
      )
    ])

    const confirmations = getConfirmations(currentBlock, receipt.blockNumber)
    const success = receipt.status === 1

    return {
      valid: success,
      confirmations,
      status: success ? "success" : "failed",
      blockNumber: receipt.blockNumber,
      timestamp: block?.timestamp,
      gasUsed: receipt.gasUsed?.toString(),
      rawData: tx?.data ?? null,
      from: tx?.from ?? null,
      to: tx?.to ?? null,
      network: networkName,
      rpc_url: cachedProviderUrl,
      error: success ? null : "TX_STATUS_FAILED"
    }
  } catch (error) {
    console.error("VALIDATE_TRANSACTION_ERROR", {
      txHash,
      rpc: cachedProviderUrl,
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR"
    })

    return {
      valid: false,
      confirmations: 0,
      status: "failed",
      network: "polygon",
      rpc_url: cachedProviderUrl,
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR"
    }
  }
}