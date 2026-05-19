// lib/audit/types.ts

/**
 * 🔗 Representa um passo na Merkle Proof
 */
export type MerkleProofStep = {
  hash: string
  position: "left" | "right"
}

/**
 * 🌳 Prova criptográfica completa
 */
export type AuditProof = {
  block_hash: string
  prev_block_hash?: string | null
  merkle_root: string
  merkle_proof: MerkleProofStep[]

  signature?: string | null
  timestamp?: string | null
}

/**
 * 📊 Dados de blockchain agregados (nível campanha / relatório)
 */
export type BlockchainStats = {
  anchor_ratio: number
  anchored_roots: number
  total_roots: number
}

/**
 * 📅 Período do relatório
 */
export type AuditPeriod = {
  start: string
  end: string
}

/**
 * 📄 Modelo principal para geração de PDF e export
 */
export type AuditInput = {
  campaign_id: string
  period: AuditPeriod
  total_plays: number

  blockchain: BlockchainStats

  /**
   * 🔐 Prova criptográfica (opcional dependendo do contexto)
   * - obrigatório para PDF verificável offline
   */
  proof?: AuditProof

  /**
   * 🔏 Assinatura do relatório (não confundir com assinatura do bloco)
   */
  signature?: string | null

  /**
   * 🔐 Hash do documento (gerado após criação)
   */
  document_hash?: string

  /**
   * 🕒 Timestamp de geração
   */
  generated_at?: string
}

/**
 * 🔍 Resultado de verificação completa
 */
export type AuditVerificationResult = {
  merkle_valid: boolean
  block_valid: boolean
  signature_valid: boolean

  fully_verified: boolean

  details?: {
    expected_root?: string
    computed_root?: string
  }
}

/**
 * 📦 Payload usado em QR Code / export offline
 */
export type AuditQrPayload = {
  event_hash?: string

  proof: AuditProof

  signature?: string | null
}