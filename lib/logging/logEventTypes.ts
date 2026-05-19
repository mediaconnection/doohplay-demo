/* =========================
   LOG EVENT TYPES (ENTERPRISE)
========================= */

export const LOG_EVENT_TYPES = {
  /* =========================
     SYSTEM
  ========================= */
  SYSTEM_START: "SYSTEM_START",
  SYSTEM_STOP: "SYSTEM_STOP",
  SYSTEM_ERROR: "SYSTEM_ERROR",

  /* =========================
     EVENT CHAIN
  ========================= */
  EVENT_CREATED: "EVENT_CREATED",
  EVENT_CHAIN_APPEND: "EVENT_CHAIN_APPEND",
  EVENT_CHAIN_ERROR: "EVENT_CHAIN_ERROR",

  /* =========================
     SIGNATURE (A1 / ICP)
  ========================= */
  SIGNATURE_CREATED: "SIGNATURE_CREATED",
  SIGNATURE_VERIFIED: "SIGNATURE_VERIFIED",
  SIGNATURE_INVALID: "SIGNATURE_INVALID",
  SIGNATURE_ERROR: "SIGNATURE_ERROR",

  /* =========================
     MERKLE
  ========================= */
  MERKLE_ROOT_CREATED: "MERKLE_ROOT_CREATED",
  MERKLE_PROOF_GENERATED: "MERKLE_PROOF_GENERATED",
  MERKLE_PROOF_VERIFIED: "MERKLE_PROOF_VERIFIED",
  MERKLE_PROOF_INVALID: "MERKLE_PROOF_INVALID",

  /* =========================
     BLOCKCHAIN
  ========================= */
  BLOCK_CREATED: "BLOCK_CREATED",
  BLOCK_ANCHORED: "BLOCK_ANCHORED",
  BLOCKCHAIN_VERIFY_SUCCESS: "BLOCKCHAIN_VERIFY_SUCCESS",
  BLOCKCHAIN_VERIFY_FAIL: "BLOCKCHAIN_VERIFY_FAIL",

  /* =========================
     VERIFY ENGINE
  ========================= */
  VERIFY_STARTED: "VERIFY_STARTED",
  VERIFY_SUCCESS: "VERIFY_SUCCESS",
  VERIFY_WARNING: "VERIFY_WARNING",
  VERIFY_FAILED: "VERIFY_FAILED",

  /* =========================
     SECURITY
  ========================= */
  SECURITY_ANOMALY: "SECURITY_ANOMALY",
  FRAUD_DETECTED: "FRAUD_DETECTED",

  /* =========================
     API
  ========================= */
  API_REQUEST: "API_REQUEST",
  API_RESPONSE: "API_RESPONSE",
  API_ERROR: "API_ERROR",

  /* =========================
     DATABASE
  ========================= */
  DB_QUERY: "DB_QUERY",
  DB_ERROR: "DB_ERROR",

  /* =========================
     AUDIT
  ========================= */
  AUDIT_EVENT_EMITTED: "AUDIT_EVENT_EMITTED",
  AUDIT_EXPORT_GENERATED: "AUDIT_EXPORT_GENERATED"
} as const

/* =========================
   TYPES
========================= */

export type LogEventType =
  (typeof LOG_EVENT_TYPES)[keyof typeof LOG_EVENT_TYPES]

export type LogEventLevel =
  | "DEBUG"
  | "INFO"
  | "WARN"
  | "ERROR"

/* =========================
   LEVEL MAP
========================= */

export const LOG_EVENT_LEVEL_MAP: Record<
  LogEventType,
  LogEventLevel
> = {
  /* =========================
     SYSTEM
  ========================= */
  SYSTEM_START: "INFO",
  SYSTEM_STOP: "INFO",
  SYSTEM_ERROR: "ERROR",

  /* =========================
     EVENT CHAIN
  ========================= */
  EVENT_CREATED: "INFO",
  EVENT_CHAIN_APPEND: "INFO",
  EVENT_CHAIN_ERROR: "ERROR",

  /* =========================
     SIGNATURE
  ========================= */
  SIGNATURE_CREATED: "INFO",
  SIGNATURE_VERIFIED: "INFO",
  SIGNATURE_INVALID: "WARN",
  SIGNATURE_ERROR: "ERROR",

  /* =========================
     MERKLE
  ========================= */
  MERKLE_ROOT_CREATED: "INFO",
  MERKLE_PROOF_GENERATED: "INFO",
  MERKLE_PROOF_VERIFIED: "INFO",
  MERKLE_PROOF_INVALID: "WARN",

  /* =========================
     BLOCKCHAIN
  ========================= */
  BLOCK_CREATED: "INFO",
  BLOCK_ANCHORED: "INFO",
  BLOCKCHAIN_VERIFY_SUCCESS: "INFO",
  BLOCKCHAIN_VERIFY_FAIL: "WARN",

  /* =========================
     VERIFY ENGINE
  ========================= */
  VERIFY_STARTED: "INFO",
  VERIFY_SUCCESS: "INFO",
  VERIFY_WARNING: "WARN",
  VERIFY_FAILED: "ERROR",

  /* =========================
     SECURITY
  ========================= */
  SECURITY_ANOMALY: "WARN",
  FRAUD_DETECTED: "ERROR",

  /* =========================
     API
  ========================= */
  API_REQUEST: "INFO",
  API_RESPONSE: "INFO",
  API_ERROR: "ERROR",

  /* =========================
     DATABASE
  ========================= */
  DB_QUERY: "DEBUG",
  DB_ERROR: "ERROR",

  /* =========================
     AUDIT
  ========================= */
  AUDIT_EVENT_EMITTED: "INFO",
  AUDIT_EXPORT_GENERATED: "INFO"
}

export default LOG_EVENT_TYPES