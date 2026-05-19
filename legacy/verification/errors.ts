import { NextResponse } from "next/server"

import { fallbackHeaders, responseHeaders } from "./http"

export type VerificationErrorCode =
  | "RATE_LIMIT_EXCEEDED"
  | "UNSUPPORTED_CONTENT_TYPE"
  | "PAYLOAD_TOO_LARGE"
  | "INVALID_JSON"
  | "INVALID_INPUT"
  | "INVALID_HASH_FORMAT"
  | "QUEUE_FAILED"
  | "INTERNAL_ERROR"
  | string

export type ErrorResponse = {
  valid: false
  error: VerificationErrorCode
  request_id: string
}

export type RateLimitResult = {
  limit?: number
  remaining?: number
  reset?: number
  allowed?: boolean
}

export function errorResponse(
  error: VerificationErrorCode,
  status: number,
  requestId: string,
  rl?: RateLimitResult
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      valid: false,
      error,
      request_id: requestId
    },
    {
      status,
      headers: rl ? responseHeaders(rl, requestId) : fallbackHeaders(requestId)
    }
  )
}