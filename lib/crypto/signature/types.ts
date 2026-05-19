export type SignatureAlgorithm =
  | "RSA-SHA256"
  | "RSA-SHA512"
  | "ECDSA-SHA256"

export type TimestampProvider = "RFC3161"

export type SignatureStatus =
  | "SIGNED"
  | "TIMESTAMPED"
  | "FAILED"

export type SignatureInput = {
  payload: unknown
  entity_id: string
  entity_type: "event" | "campaign" | "block"
  hash?: string
  include_timestamp?: boolean
}

export type CanonicalPayloadResult = {
  canonical: string
  digest_hex: string
}

export type SignatureMaterial = {
  algorithm: SignatureAlgorithm
  signature_base64: string
  digest_hex: string
  signed_at: string
  certificate_pem?: string | null
  certificate_chain_pem?: string[] | null
  public_key_pem?: string | null
}

export type TimestampTokenResult = {
  provider: TimestampProvider
  tsa_url: string
  token_base64: string
  serial_number?: string | null
  gen_time?: string | null
  policy_oid?: string | null
  digest_hex: string
  created_at: string
}

export type SignatureEvidencePackage = {
  status: SignatureStatus
  entity_id: string
  entity_type: "event" | "campaign" | "block"
  digest_hex: string
  canonical: string
  signature: SignatureMaterial
  timestamp?: TimestampTokenResult | null
  created_at: string
  request_id?: string
  warnings?: string[]
}

export type VerifySignatureResult = {
  valid: boolean
  algorithm?: SignatureAlgorithm
  digest_match?: boolean
  signature_valid?: boolean
  certificate_present?: boolean
  timestamp_present?: boolean
  timestamp_valid?: boolean
  reasons: string[]
  details?: Record<string, unknown>
}