import { Evidence } from "./Evidence"
import { MerkleProof } from "./MerkleProof"
import { ProofCertificate } from "./ProofCertificate"

export interface ProofGraph {

  subject: {
    id: string
    type: "impression" | "campaign" | "audience"
    hash: string
  }

  screen?: {
    id: string
  }

  campaign?: {
    id: string
  }

  evidence: Evidence[]

  merkle?: MerkleProof | null

  block?: {
    block_height: number
    event_hash: string
    previous_hash: string
  } | null

  anchor?: {
    network: string
    tx: string
    timestamp: string
  } | null

  certificate?: ProofCertificate | null

}