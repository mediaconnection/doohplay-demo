import { ethers } from "ethers"

const BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD"
const POLYGON_MAINNET_CHAIN_ID = ethers.toBigInt(137)

type AnchorReportResult = {
  tx_hash: string
  block_number: number | null
  chain_id: number
}

function getEnv(name: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing env: ${name}`)
  }

  return value
}

function normalizeHash(hash: string): string {
  const normalized = hash.trim().toLowerCase()

  if (!/^0x?[a-f0-9]{64}$/i.test(normalized)) {
    throw new Error("Invalid hash format")
  }

  return normalized.startsWith("0x") ? normalized : `0x${normalized}`
}

export async function anchorReport(
  hash: string
): Promise<AnchorReportResult | null> {
  try {
    const normalizedHash = normalizeHash(hash)

    const rpcUrl = getEnv("POLYGON_RPC_URL")
    const privateKey = getEnv("WALLET_PRIVATE_KEY")

    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const network = await provider.getNetwork()

    if (network.chainId !== POLYGON_MAINNET_CHAIN_ID) {
      console.warn("⚠️ Not Polygon mainnet:", network.chainId.toString())
    }

    const wallet = new ethers.Wallet(privateKey, provider)

    const feeData = await provider.getFeeData()

    const maxFeePerGas =
      feeData.maxFeePerGas ?? ethers.parseUnits("40", "gwei")

    const maxPriorityFeePerGas =
      feeData.maxPriorityFeePerGas ?? ethers.parseUnits("2", "gwei")

    const nonce = await provider.getTransactionCount(wallet.address, "latest")

    const tx = await wallet.sendTransaction({
      to: BURN_ADDRESS,
      value: ethers.toBigInt(0),
      data: normalizedHash,
      nonce,
      maxFeePerGas,
      maxPriorityFeePerGas
    })

    console.log("📡 Anchor tx sent:", tx.hash)

    const receipt = (await Promise.race([
      tx.wait(),
      new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error("Timeout waiting tx")), 20000)
      })
    ])) as ethers.TransactionReceipt | null

    console.log("✅ Anchored in block:", receipt?.blockNumber)

    return {
      tx_hash: tx.hash,
      block_number: receipt?.blockNumber ?? null,
      chain_id: Number(network.chainId)
    }
  } catch (err) {
    console.error("❌ Anchor error:", err)
    return null
  }
}