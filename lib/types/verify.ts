/* =========================
   BASE TYPES
========================= */

export type VerifyStatus =
  | "VERIFIED"
  | "WARNING"
  | "FAILED"

export type TrustLevel = "HIGH" | "MEDIUM" | "LOW"
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH"

export type BlockchainNetwork =
  | "polygon"
  | "ethereum"
  | "testnet"
  | "unknown"

/* =========================
   FAILED RESPONSE
========================= */

export type VerifyFailedResponse = {
  status: "FAILED"
  error: string
}

/* =========================
   SUCCESS / WARNING RESPONSE
========================= */

export type VerifySuccessResponse = {
  status: "VERIFIED" | "WARNING"

  trust: TrustLevel
  score: number
  reasons: string[]

  risk: RiskLevel

  blockchain: boolean

  /* =========================
     CORE VALIDATION
  ========================= */

  details: {
    signature: boolean
    merkle: boolean
    chain: boolean

    cert_chain?: boolean
    revoked?: boolean
  }

  /* =========================
     🔐 CERTIFICADO (CRIPTO)
  ========================= */

  certificate?: {
    issuer?: string
    subject?: string
    serial?: string
    valid?: boolean
  }

  /* =========================
     💾 CERTIFICADO (DB)
  ========================= */

  certificate_record?: {
    hash: string
    created_at: string
  }

  /* =========================
     🕒 TSA
  ========================= */

  tsa?: {
    timestamp: string
    authority: string
    valid: boolean
  }

  /* =========================
     ⛓️ BLOCKCHAIN
  ========================= */

  anchor?: {
    network: BlockchainNetwork
    tx_hash: string
    block: number
    confirmed: boolean
  }

  /* =========================
     📦 EVENTO
  ========================= */

  event?: {
    hash: string
    timestamp: string
  }

  /* =========================
     🔍 VERIFICATION (AUDIT)
  ========================= */

  verification?: {
    event_exists: boolean
    certificate_exists: boolean

    event_hash_valid: boolean
    merkle_valid: boolean

    certificate_hash_valid: boolean
    signature_valid: boolean

    cert_chain_valid?: boolean
    revoked?: boolean

    integrity: boolean
  }

  /* =========================
     🔗 CHAIN DETAILS
  ========================= */

  chain?: {
    valid: boolean
    depth: number
    errors: string[]
  }

  /* =========================
     🧠 DEBUG
  ========================= */

  debug?: {
    errors?: string[]
    latency_ms?: number
  }

  /* =========================
     META
  ========================= */

  meta?: {
    hash: string
  }
}

/* =========================
   UNION TYPE
========================= */

export type VerifyResponse =
  | VerifySuccessResponse
  | VerifyFailedResponse