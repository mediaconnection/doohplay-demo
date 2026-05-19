import { ethers } from "ethers"

type AnchorMerkleResult = {
  tx_hash: string
  block_number: number | null
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

function getPrivateKey(): string {
  const privateKey =
    process.env.WALLET_PRIVATE_KEY ||
    process.env.POLYGON_PRIVATE_KEY ||
    process.env.PRIVATE_KEY

  if (!privateKey) {
    throw new Error("WALLET_PRIVATE_KEY_NOT_CONFIGURED")
  }

  const normalized = privateKey.trim()

  if (!/^0x[a-f0-9]{64}$/i.test(normalized)) {
    throw new Error("INVALID_WALLET_PRIVATE_KEY")
  }

  return normalized
}

function getAnchorTarget(wallet: ethers.Wallet): string {
  const target =
    process.env.POLYGON_ANCHOR_ADDRESS ||
    process.env.ANCHOR_CONTRACT_ADDRESS ||
    process.env.NEXT_PUBLIC_ANCHOR_CONTRACT_ADDRESS

  if (target && ethers.isAddress(target)) {
    return target
  }

  return wallet.address
}

export async function anchorMerkleRoot(root: string): Promise<AnchorMerkleResult> {
  const normalizedRoot = normalizeRoot(root)

  if (!isValidRoot(normalizedRoot)) {
    throw new Error("INVALID_MERKLE_ROOT")
  }

  const provider = new ethers.JsonRpcProvider(getRpcUrl())
  const wallet = new ethers.Wallet(getPrivateKey(), provider)
  const target = getAnchorTarget(wallet)

  const tx = await wallet.sendTransaction({
    to: target,
    value: ethers.toBigInt(0),
    data: ethers.hexlify(ethers.toUtf8Bytes(normalizedRoot))
  })

  const receipt = await tx.wait()

  return {
    tx_hash: tx.hash,
    block_number: receipt?.blockNumber ?? null
  }
}