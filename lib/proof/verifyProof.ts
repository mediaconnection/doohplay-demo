import { verifyMerkleProof } from "@/lib/proof/merkle/verifyMerkleProof"

interface Proof {
  event_hash: string
  merkle_proof: any[]
  merkle_root: string
}

export function verifyProof(proof: Proof) {

  const valid = verifyMerkleProof(
    proof.event_hash,
    proof.merkle_proof,
    proof.merkle_root
  )

  return {
    valid,
    event_hash: proof.event_hash,
    merkle_root: proof.merkle_root
  }
}
