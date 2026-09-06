// @ts-nocheck
import { ethers } from "ethers"

const rpcUrl =
  process.env.POLYGON_RPC ||
  process.env.BLOCKCHAIN_RPC ||
  "https://polygon-rpc.com"

const privateKey =
  process.env.WALLET_PRIVATE_KEY ||
  process.env.BLOCKCHAIN_PRIVATE_KEY

if (!privateKey) {
  throw new Error("Missing WALLET_PRIVATE_KEY or BLOCKCHAIN_PRIVATE_KEY")
}

export const provider = new ethers.JsonRpcProvider(rpcUrl)
export const wallet = new ethers.Wallet(privateKey, provider)

console.log("🔐 Wallet address:", wallet.address)


