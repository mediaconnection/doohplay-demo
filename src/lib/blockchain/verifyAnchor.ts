// @ts-nocheck
import { ethers } from "ethers"

const ABI = [
  "function isAnchored(bytes32 merkleRoot) view returns (bool)",
  "function anchorIndex(bytes32 merkleRoot) view returns (uint256)"
]

function getProvider() {
  return new ethers.JsonRpcProvider(
    process.env.BLOCKCHAIN_RPC
  )
}

function getContract() {
  const provider = getProvider()

  return new ethers.Contract(
    process.env.ANCHOR_CONTRACT_ADDRESS!,
    ABI,
    provider
  )
}

export async function verifyAnchorOnChain(
  merkleRoot: string
) {

  if (!merkleRoot) {
    return { anchored: false }
  }

  try {

    const contract = getContract()

    const rootHex = "0x" + merkleRoot.toLowerCase()

    const anchored = await contract.isAnchored(rootHex)

    let index = null

    if (anchored) {
      index = await contract.anchorIndex(rootHex)
    }

    return {
      anchored,
      index: index ? Number(index) : null
    }

  } catch (error) {

    console.error("anchor verify error", error)

    return {
      anchored: false,
      error: "blockchain_unreachable"
    }
  }
}
