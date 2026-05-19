import { ethers } from "ethers"

export type VerifyAnchorOnChainResult = {
  anchored: boolean
  index: number | null
  merkle_root: string
  tx_hash: string | null
  error?: string | null
}

function normalizeRoot(root: string): string {
  return root.trim().toLowerCase().replace(/^0x/, "")
}

function isValidRoot(root: string): boolean {
  return /^[a-f0-9]{64}$/i.test(normalizeRoot(root))
}

function getRpcUrl(): string {
  const rpcUrl =
    process.env.POLYGON_RPC ||
    process.env.POLYGON_RPC_URL ||
    process.env.NEXT_PUBLIC_POLYGON_RPC_URL

  if (!rpcUrl) {
    throw new Error("POLYGON_RPC_NOT_CONFIGURED")
  }

  return rpcUrl
}

function getAnchorContractAddress(): string | null {
  const address =
    process.env.POLYGON_ANCHOR_ADDRESS ||
    process.env.ANCHOR_CONTRACT_ADDRESS ||
    process.env.NEXT_PUBLIC_ANCHOR_CONTRACT_ADDRESS

  if (!address || !ethers.isAddress(address)) {
    return null
  }

  return address
}

const ANCHOR_ABI = [
  "function roots(bytes32 root) view returns (bool)",
  "function isAnchored(bytes32 root) view returns (bool)",
  "function getRootIndex(bytes32 root) view returns (uint256)"
]

export async function verifyAnchorOnChain(
  root: string
): Promise<VerifyAnchorOnChainResult> {
  const normalizedRoot = normalizeRoot(root)

  if (!isValidRoot(normalizedRoot)) {
    return {
      anchored: false,
      index: null,
      merkle_root: normalizedRoot,
      tx_hash: null,
      error: "INVALID_MERKLE_ROOT"
    }
  }

  const contractAddress = getAnchorContractAddress()

  if (!contractAddress) {
    return {
      anchored: false,
      index: null,
      merkle_root: normalizedRoot,
      tx_hash: null,
      error: "ANCHOR_CONTRACT_NOT_CONFIGURED"
    }
  }

  try {
    const provider = new ethers.JsonRpcProvider(getRpcUrl())
    const contract = new ethers.Contract(contractAddress, ANCHOR_ABI, provider)

    const rootBytes32 = `0x${normalizedRoot}`

    let anchored = false

    try {
      anchored = Boolean(await contract.isAnchored(rootBytes32))
    } catch {
      anchored = Boolean(await contract.roots(rootBytes32))
    }

    let index: number | null = null

    try {
      const rawIndex = await contract.getRootIndex(rootBytes32)
      index = Number(rawIndex)

      if (!Number.isFinite(index)) {
        index = null
      }
    } catch {
      index = null
    }

    return {
      anchored,
      index,
      merkle_root: normalizedRoot,
      tx_hash: null,
      error: null
    }
  } catch (error) {
    console.error("VERIFY_ANCHOR_ON_CHAIN_ERROR", error)

    return {
      anchored: false,
      index: null,
      merkle_root: normalizedRoot,
      tx_hash: null,
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR"
    }
  }
}