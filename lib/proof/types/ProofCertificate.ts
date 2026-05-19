export type ProofSubjectType =
  | "impression"
  | "campaign"
  | "audience"

export interface ProofCertificate {

  certificate_id: string

  subject_type: ProofSubjectType

  subject_id: string

  subject_hash: string

  merkle_root: string
  merkle_leaf: string

  block_height: number
  block_hash: string

  anchor_network: string
  anchor_tx: string

  certificate_hash: string

  signature: string

  pdf_url?: string | null

  created_at: string

}