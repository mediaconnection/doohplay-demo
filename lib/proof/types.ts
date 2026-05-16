/* =========================
   CORE ENUMS
========================= */

export type VerificationStatus =
  | "VERIFIED"
  | "WARNING"
  | "FAILED"

export type PendingVerificationStatus = "PENDING"

export type VerifyLifecycleStatus =
  | VerificationStatus
  | PendingVerificationStatus

export type TrustLevel = "HIGH" | "MEDIUM" | "LOW"

export type ScoreLabel = "High Trust" | "Moderate Trust" | "Low Trust"

export type LayerName =
  | "icp"
  | "merkle"
  | "blockchain"
  | "signature"
  | "chain"
  | "timestamp"
  | "certificate"
  | "event"
  | "block"
  | "anchor"
  | "input"
  | "lookup"
  | "storage"

export type EntityType = "event" | "campaign" | "block"

export type ProofSource = "cache" | "live" | "queue"

/* =========================
   MERKLE
========================= */

export type MerkleProofNode =
  | string
  | {
      position?: "left" | "right"
      hash: string
    }

/* =========================
   STANDARDIZED REASONS (AUDIT SAFE)
========================= */

export type FailureReason =
  | "ICP_FAIL"
  | "MERKLE_FAIL"
  | "BLOCKCHAIN_FAIL"
  | "INVALID_SIGNATURE"
  | "CHAIN_INVALID"
  | "CERT_REVOKED"
  | "CERT_EXPIRED"
  | "HASH_MISMATCH"
  | "PROOF_NOT_FOUND"
  | "INVALID_INPUT"
  | "INVALID_MERKLE_ROOT"
  | "INVALID_MERKLE_PROOF"
  | "INVALID_BLOCKCHAIN_TX"
  | "RPC_UNAVAILABLE"
  | "LAYER_TIMEOUT"

export type ReasonLike = FailureReason | string

/* =========================
   CROSS-LAYER
========================= */

export type CrossLayerIssueCode =
  | "ICP_MISSING"
  | "MERKLE_MISSING"
  | "BLOCKCHAIN_MISSING"
  | "HASH_IDENTITY_MISMATCH"
  | "MERKLE_ROOT_MISMATCH"
  | "ANCHOR_MISMATCH"
  | "CHAIN_IDENTITY_MISMATCH"
  | "PARTIAL_PROOF_ONLY"

export type CrossLayerIssueSeverity = "low" | "medium" | "high"

export type CrossLayerIssue = {
  code: CrossLayerIssueCode
  severity: CrossLayerIssueSeverity
  message: string
}

/* =========================
   COMMON META
========================= */

export type LayerMeta = {
  reasons?: FailureReason[]
  detail?: string

  certification_found?: boolean
  certification_id?: string | null

  hash_match?: boolean
  input_hash?: string | null
  certified_hash?: string | null
  certification_hash?: string | null
  leaf_hash?: string | null

  entity_id_match?: boolean
  input_entity_id?: string | null
  certified_entity_id?: string | null

  entity_type_match?: boolean
  input_entity_type?: string | null
  certified_entity_type?: string | null

  proof_valid?: boolean
  merkle_proof_valid?: boolean
  merkle_root_valid?: boolean
  proof_present?: boolean
  proof_length?: number
  proof_depth?: number
  proof_error?: string | null

  merkle_root?: string | null
  computed_root?: string | null
  root_match?: boolean
  merkle_match?: boolean
  merkle_root_expected?: string | null
  decoded_root?: string | null

  anchored?: boolean
  blockchain_valid?: boolean
  blockchain_tx?: string | null
  tx_hash?: string | null
  tx_hash_format_valid?: boolean
  tx_status?: "success" | "failed" | "pending" | string
  tx_confirmations?: number
  confirmations?: number
  confirmations_required?: number
  confirmations_ok?: boolean

  tx_method?: string | null
  method?: string | null
  allowed_methods?: string[]
  method_match?: boolean

  tx_network?: string | null
  network?: string | null

  from?: string | null
  to?: string | null
  contract_address?: string | null
  expected_contract_address?: string | null
  contract_match?: boolean

  gas_used?: string | null
  block_number?: number | null
  block_timestamp?: number | null
  raw_data_present?: boolean

  decoded_args?: unknown[] | null
  decode_error?: string | null

  signature_present?: boolean
  signature_valid?: boolean

  certificate_present?: boolean
  certificate_valid?: boolean
  certificate_revoked?: boolean
  certificate_url?: string | null

  chain_valid?: boolean
  chain_depth?: number
  chain_errors?: string[]

  revoked?: boolean
  expires_at?: string | null
  issued_at?: string | null
  created_at?: string | null
  updated_at?: string | null

  cross_layer_valid?: boolean
  cross_layer_consistent?: boolean
  cross_layer_summary?: string
  cross_layer_issues?: CrossLayerIssue[]

  duration_ms?: number

  [key: string]: unknown
}

export type ProofMeta = {
  entity_id?: string
  entity_type?: EntityType
  hash?: string

  input_hash?: string
  resolved_hash?: string

  certification_found?: boolean
  certification_id?: string | null

  execution_ms?: number
  cache_hit?: boolean

  request_id?: string
  queued?: boolean
  source?: ProofSource

  engine_version?: string
  generated_at?: string
  started_at?: string
  finished_at?: string

  layers_enabled?: number
  layers_executed?: number
  enabled_layers?: LayerName[]

  cross_layer_valid?: boolean
  cross_layer_consistent?: boolean
  cross_layer_summary?: string
  cross_layer_issues?: CrossLayerIssue[]

  score?: number
  confidence?: number

  [key: string]: unknown
}

/* =========================
   LAYER
========================= */

export type LayerResult = {
  name: LayerName
  valid: boolean
  weight?: number

  reasons?: FailureReason[]
  message?: string | null
  error?: string | null

  meta?: LayerMeta
  details?: Record<string, unknown> | null

  duration_ms?: number | null
}

/* =========================
   INPUT
========================= */

export type ProofInput = {
  hash: string
  entity_id: string
  entity_type: EntityType
  payload?: unknown
}

/* =========================
   CERTIFICATION
========================= */

export type CertificationRecord = {
  id?: string
  content_hash: string
  entity_id: string
  entity_type: EntityType

  merkle_root?: string | null
  merkle_proof?: MerkleProofNode[] | null
  blockchain_tx?: string | null
  tx_hash?: string | null

  signature?: string | null
  certificate_url?: string | null

  created_at?: string
  updated_at?: string | null

  [key: string]: unknown
}

/* =========================
   CONTEXT (SAFE)
========================= */

export type ProofContext = {
  input: ProofInput
  cert?: CertificationRecord | null
  started_at?: number
  request_id?: string
}

/* =========================
   SCORE
========================= */

export type ScoreBreakdownItem = {
  layer: LayerName
  valid: boolean
  weight: number
  contribution: number
}

export type PenaltyBreakdownItem = {
  reason: FailureReason
  penalty: number
}

export type ScoreComputation = {
  score: number
  trust: TrustLevel
  breakdown: ScoreBreakdownItem[]
  penalties: PenaltyBreakdownItem[]
}

/* =========================
   EXPLANATION
========================= */

export type TechnicalDetails = {
  icp: boolean
  merkle: boolean
  blockchain: boolean

  signature_valid?: boolean
  signature_present?: boolean

  certificate_present?: boolean
  certificate_valid?: boolean
  certificate_revoked?: boolean

  chain_valid?: boolean
  revoked?: boolean

  anchored?: boolean
  blockchain_valid?: boolean

  merkle_root_valid?: boolean
  merkle_proof_valid?: boolean

  cross_layer_valid?: boolean
  cross_layer_consistent?: boolean
}

export type ExplanationAuditLayer = {
  name: LayerName
  valid: boolean
  weight?: number | null
  reasons?: FailureReason[]
}

export type ExplanationCompliance = {
  icp_brasil?: boolean
  blockchain_anchor?: boolean
  merkle_proof?: boolean
  signature_valid?: boolean
  certificate_valid?: boolean
}

export type ExplanationOutput = {
  summary: string
  status?: VerificationStatus
  score?: number
  trust_level: TrustLevel

  key_factors: FailureReason[]
  risk_factors: FailureReason[]
  technical_details: TechnicalDetails
  audit_flags: FailureReason[]
  recommendation?: string

  audit?: {
    layers: ExplanationAuditLayer[]
  }

  compliance?: ExplanationCompliance
}

export type ExplanationInput = {
  status: VerificationStatus
  score: number
  reasons: FailureReason[]
  layers: LayerResult[]
}

/* =========================
   RESULT (STRICT)
========================= */

export type ProofResult = {
  valid: boolean
  status: VerificationStatus
  score: number
  trust: TrustLevel

  layers: LayerResult[]
  reasons: FailureReason[]

  root?: string
  explanation?: ExplanationOutput
  meta?: ProofMeta
}

/* =========================
   PARTIAL RESULT (INTERNAL ONLY)
========================= */

export type ProofResultLike = {
  valid?: boolean
  pending?: boolean

  status?: VerificationStatus
  score?: number
  trust?: TrustLevel

  layers?: LayerResult[]
  reasons?: FailureReason[]

  explanation?: ExplanationOutput
  meta?: ProofMeta

  request_id?: string
  source?: ProofSource

  hash?: string
  hash_0x?: string
  trust_level?: TrustLevel
  risk?: "LOW" | "MEDIUM" | "HIGH"
  risk_level?: "LOW" | "MEDIUM" | "HIGH"

  [key: string]: unknown
}