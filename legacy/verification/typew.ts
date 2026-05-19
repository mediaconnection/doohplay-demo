export const ALLOWED_ENTITY_TYPES = ["event", "campaign", "block"] as const

export type EntityType = (typeof ALLOWED_ENTITY_TYPES)[number]

export type RawInput = {
  hash?: unknown
  entity_id?: unknown
  entity_type?: unknown
  payload?: unknown
}

export type NormalizedInput = {
  hash: string
  entity_id: string
  entity_type: EntityType
  payload?: unknown
}

export type RateLimitResult = {
  allowed: boolean
  remaining?: number | null
  reset?: number | null
}

export type VerificationErrorCode =
  | "RATE_LIMIT_EXCEEDED"
  | "UNSUPPORTED_CONTENT_TYPE"
  | "PAYLOAD_TOO_LARGE"
  | "INVALID_JSON"
  | "INVALID_INPUT"
  | "INVALID_HASH_FORMAT"
  | "QUEUE_FAILED"
  | "INTERNAL_ERROR"

export type BaseResponse = {
  request_id: string
}

export type PendingResponse = BaseResponse & {
  valid: null
  pending: true
  status: "PENDING"
  message: "Processing queued"
  source: "queue"
}

export type ErrorResponse = BaseResponse & {
  valid: false
  error: VerificationErrorCode
}