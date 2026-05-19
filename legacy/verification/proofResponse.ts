import { NextResponse } from "next/server"

import { fallbackHeaders, responseHeaders } from "./http"

export type RateLimitResult = {
  limit?: number
  remaining?: number
  reset?: number
  allowed?: boolean
}

type ProofPayload = Record<string, unknown>

export function proofResponse(
  payload: ProofPayload,
  requestId: string,
  rl?: RateLimitResult
): NextResponse<ProofPayload> {
  return NextResponse.json(payload, {
    status: 200,
    headers: rl ? responseHeaders(rl, requestId) : fallbackHeaders(requestId)
  })
}

export function cachedProofResponse(
  cached: unknown,
  requestId: string,
  rl?: RateLimitResult
): NextResponse<ProofPayload> {
  return proofResponse(
    {
      valid: true,
      source: "cache",
      request_id: requestId,
      proof: cached
    },
    requestId,
    rl
  )
}

export function liveProofResponse(
  result: unknown,
  requestId: string,
  rl?: RateLimitResult
): NextResponse<ProofPayload> {
  return proofResponse(
    {
      source: "live",
      request_id: requestId,
      result
    },
    requestId,
    rl
  )
}

export function queuedProofResponse(
  requestId: string,
  rl?: RateLimitResult
): NextResponse<ProofPayload> {
  return NextResponse.json(
    {
      valid: false,
      status: "PENDING",
      source: "queue",
      request_id: requestId
    },
    {
      status: 202,
      headers: rl ? responseHeaders(rl, requestId) : fallbackHeaders(requestId)
    }
  )
}
