export type VerificationStatus =
  | "VERIFIED"
  | "WARNING"
  | "FAILED"
  | "PENDING"
  | (string & {})

export type TrustLevel =
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | (string & {})

export type RiskLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | (string & {})

export type NullableBool = boolean | null

export type VerificationLayerName =
  | "event"
  | "icp"
  | "signature"
  | "merkle"
  | "block"
  | "blockchain"
  | "anchor"
  | "chain"
  | "timestamp"
  | "certificate"
  | "storage"
  | "lookup"
  | "input"
  | (string & {})

export type VerificationLayerCategory =
  | "Certificação"
  | "Assinatura"
  | "Integridade"
  | "Blockchain"
  | "Temporal"
  | "Auditoria"

export type VerificationLayerSeverity =
  | "Crítico"
  | "Alto"
  | "Médio"
  | "Baixo"

export type VerificationLayer = {
  name: VerificationLayerName
  valid: NullableBool
  weight?: number
  reasons?: string[]
  message?: string | null
  error?: string | null
  details?: Record<string, unknown> | null
  meta?: Record<string, unknown> | null
  duration_ms?: number | null
  category?: VerificationLayerCategory
  severity?: VerificationLayerSeverity
}

export type VerificationChainDetails = {
  valid?: NullableBool
  previous_event_hash?: string | null
  previous_event_exists?: NullableBool
  is_chain_head?: NullableBool
}

export type VerificationMerkleDetails = {
  included?: NullableBool
  merkle_root?: string | null
  proof_present?: NullableBool
  proof_length?: number
}

export type VerificationBlockDetails = {
  exists?: NullableBool
  block_id?: number | string | null
  block_hash?: string | null
  prev_block_hash?: string | null
  merkle_root?: string | null
  merkle_matches?: NullableBool
  event_count?: number | null
  created_at?: string | null
}

export type VerificationBlockchainDetails = {
  anchored?: NullableBool
  anchored_at?: string | null
  tx_hash?: string | null
  tx_hash_format_valid?: NullableBool
  network?: string | null
  block_tx_hash?: string | null
  blockchain_tx?: string | null
}

export type VerificationCertificateDetails = {
  found?: NullableBool
  valid?: NullableBool
  cert_chain_valid?: NullableBool
  revoked?: NullableBool
  source_table?: string | null
  fingerprint?: string | null
  subject?: string | null
  issuer?: string | null
}

export type VerificationTimestampDetails = {
  token_present?: NullableBool
}

export type VerificationExecutionDetails = {
  event_id?: string | null
  created_at?: string | null
  block_created_at?: string | null
}

export type VerificationEvidence = {
  ledger?: NullableBool
  merkle?: NullableBool
  signature?: NullableBool
  anchoring?: NullableBool
  tx_hash?: string | null
  timestamp_token?: NullableBool
  source?: string | null
}

export type VerificationDetails = {
  event_exists?: NullableBool

  /* legado / compatibilidade */
  hash_valid?: NullableBool
  signature_valid?: NullableBool

  certificate_valid?: NullableBool
  certificate_found?: NullableBool
  certificate_revoked?: NullableBool
  certificate_hash_valid?: NullableBool
  cert_chain_valid?: NullableBool

  merkle_valid?: NullableBool
  merkle_proof_valid?: NullableBool
  merkle_root_valid?: NullableBool

  anchored?: NullableBool
  blockchain_valid?: NullableBool
  tx_hash_format_valid?: NullableBool

  chain_valid?: NullableBool
  chain_head?: NullableBool

  timestamp_valid?: NullableBool

  integrity?: NullableBool

  /* contrato enterprise novo */
  event_id?: string | null
  event_type?: string | null
  source_table?: string | null
  source_id?: string | null
  device_id?: string | null
  campaign_id?: string | null
  occurred_at?: string | null
  created_at?: string | null

  event_hash_valid?: NullableBool
  payload_hash_present?: NullableBool
  previous_event_hash_present?: NullableBool

  signature_present?: NullableBool
  signature_algorithm?: string | null
  signature_encoding?: string | null

  merkle_included?: NullableBool
  merkle_proof_present?: NullableBool

  block_exists?: NullableBool
  block_id?: number | string | null
  block_hash?: string | null
  block_merkle_root?: string | null
  block_merkle_matches?: NullableBool
  block_previous_hash?: string | null

  blockchain_tx?: string | null
  block_tx_hash?: string | null
  tx_valid?: NullableBool
  timestamp_token_present?: NullableBool

  proof_payload_hash?: string | null
  signed_at?: string | null

  chain?: VerificationChainDetails
  merkle?: VerificationMerkleDetails
  block?: VerificationBlockDetails
  blockchain?: VerificationBlockchainDetails
  certificate?: VerificationCertificateDetails
  timestamp?: VerificationTimestampDetails
  execution?: VerificationExecutionDetails

  [key: string]: unknown
}

export type VerificationTechnicalDetails = {
  event_exists?: NullableBool
  hash_valid?: NullableBool
  event_hash_valid?: NullableBool

  icp?: NullableBool

  merkle?: NullableBool
  merkle_included?: NullableBool
  merkle_proof_valid?: NullableBool
  merkle_root_valid?: NullableBool

  blockchain?: NullableBool
  blockchain_valid?: NullableBool
  anchored?: NullableBool
  tx_hash_format_valid?: NullableBool

  signature_valid?: NullableBool
  signature_present?: NullableBool

  certificate_present?: NullableBool
  certificate_valid?: NullableBool
  certificate_revoked?: NullableBool
  cert_chain_valid?: NullableBool

  chain_valid?: NullableBool
  chain_head?: NullableBool

  revoked?: NullableBool
  timestamp_valid?: NullableBool
  timestamp_token_present?: NullableBool

  block_exists?: NullableBool
  block_merkle_matches?: NullableBool

  cross_layer_valid?: NullableBool
  cross_layer_consistent?: NullableBool

  [key: string]: unknown
}

export type VerificationExplanationAuditLayer = {
  name?: VerificationLayerName
  valid?: NullableBool
  weight?: number | null
  reasons?: string[]
}

export type VerificationExplanationAudit = {
  layers?: VerificationExplanationAuditLayer[]
}

export type VerificationExplanationCompliance = {
  icp_brasil?: NullableBool
  blockchain_anchor?: NullableBool
  merkle_proof?: NullableBool
  signature_valid?: NullableBool
  certificate_valid?: NullableBool
  [key: string]: unknown
}

export type VerificationExplanation = {
  summary?: string
  status?: VerificationStatus
  score?: number
  key_factors?: string[]
  risk_factors?: string[]
  trust_level?: TrustLevel
  recommendation?: string
  audit_flags?: string[]
  technical_details?: VerificationTechnicalDetails
  audit?: VerificationExplanationAudit
  compliance?: VerificationExplanationCompliance
}

export type VerificationEvidenceSources = {
  event_chain?: NullableBool
  event_blocks?: NullableBool
  certificate_table?: string | null
}

export type VerificationCrossLayerIssue = {
  code?: string
  severity?: "low" | "medium" | "high" | (string & {})
  message?: string
  [key: string]: unknown
}

export type VerificationMetadata = {
  verification_id?: string
  verified_at?: string
  generated_at?: string
  checked_at?: string
  started_at?: string
  finished_at?: string

  latency_ms?: number
  total_time_ms?: number
  duration_ms?: number
  execution_ms?: number

  request_id?: string
  engine_version?: string
  schema_version?: string
  source?: string
  mode?: string

  hash?: string
  input_hash?: string
  resolved_hash?: string

  entity_id?: string
  entity_type?: string

  score?: number
  confidence?: number

  environment?: string
  cache_hit?: boolean
  queued?: boolean
  correlation_id?: string

  certification_found?: NullableBool
  certification_id?: string | null

  evidence_sources?: VerificationEvidenceSources

  layers_enabled?: number
  layers_executed?: number
  enabled_layers?: VerificationLayerName[]

  cross_layer_valid?: boolean
  cross_layer_consistent?: boolean
  cross_layer_summary?: string
  cross_layer_issues?: VerificationCrossLayerIssue[]

  [key: string]: unknown
}

/* =========================================================
   TRUST SCORE EXPLICÁVEL
========================================================= */

export type TrustScoreStatus =
  | "PASS"
  | "PARTIAL"
  | "FAIL"
  | "NOT_EVALUATED"

export type TrustScoreImpact =
  | "positive"
  | "negative"
  | "neutral"

export type TrustScoreFactor = {
  code: string
  label: string
  impact: TrustScoreImpact
  value: NullableBool
  points: number
}

export type TrustScoreDomainKey =
  | "event_integrity"
  | "chain_of_custody"
  | "merkle_evidence"
  | "blockchain_anchor"
  | "certificate_assurance"
  | "timestamp_assurance"
  | "signature_assurance"
  | (string & {})

export type TrustScoreDomain = {
  key: TrustScoreDomainKey
  label: string
  weight: number
  score: number
  status: TrustScoreStatus
  factors: TrustScoreFactor[]
}

export type TrustScoreBreakdown = {
  final_score: number
  trust_level: TrustLevel
  methodology: string
  domains: TrustScoreDomain[]
  strengths: string[]
  penalties: string[]
  summary: string
}

export type VerificationResult = {
  status?: VerificationStatus
  trust_level?: TrustLevel
  risk_level?: RiskLevel

  score?: number
  confidence?: number

  reasons?: string[]
  errors?: string[]

  summary?: string
  explanation?: VerificationExplanation
  details?: VerificationDetails
  layers?: VerificationLayer[]
  metadata?: VerificationMetadata

  trust_score?: TrustScoreBreakdown

  strengths?: string[]
  penalties?: string[]
  domains?: TrustScoreDomain[]
  evidence?: VerificationEvidence

  event_hash?: string | null
  timestamp?: string | null

  anchor_tx_hash?: string | null
  certificate_subject?: string | null
  certificate_issuer?: string | null

  source?: string | null
  request_id?: string | null

  [key: string]: unknown
}