// @ts-nocheck
// @deprecated — código morto, confirmado 2026-09-06 (Fase 0 da extração de
// packages/proof-engine). `verifyAnchorOnChain` não tem nenhum consumidor
// real neste repositório (grep exaustivo, zero import fora deste arquivo).
// Achado colateral: a cópia em lib/blockchain/verifyAnchor.ts (raiz) também
// não tem consumidor real — as duas parecem superadas por
// lib/blockchain/validateAnchoredMerkleRoot.ts (via verifyAnchoredRoot),
// que é o caminho de fato usado por app/api/verify/batch/route.ts. Não
// remover, só documentado; decisão de limpar fica pra revisão do usuário.
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
