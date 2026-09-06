// @ts-nocheck
import { ethers } from "ethers"

const CONTRACT_ADDRESS = process.env.MERKLE_CONTRACT!
const ABI = [
  "function anchorRoot(bytes32 root)",
]

export async function anchorRoot(root: string) {
  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC)

  const wallet = new ethers.Wallet(
    process.env.PRIVATE_KEY!,
    provider
  )

  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    ABI,
    wallet
  )

  const tx = await contract.anchorRoot(root)

  await tx.wait()

  return tx.hash
}
