// @ts-nocheck
export type RateLimitResult = {
  limited?: boolean
  allowed: boolean
  remaining: number
  resetAt?: number
  reset?: number
}

export type ProofResponse = {
  hash: string
  status: "VERIFIED" | "WARNING" | "FAILED" | "PENDING"
  score?: number
  trust_level?: "HIGH" | "MEDIUM" | "LOW"
  error?: string
}

export function buildProofResponse(data: Partial<ProofResponse>): ProofResponse {
  return {
    hash: data.hash ?? "",
    status: data.status ?? "FAILED",
    score: data.score,
    trust_level: data.trust_level,
    error: data.error,
  }
}

export const queuedProofResponse = (
  _hashOrId: unknown,
  _requestId?: unknown,
  _meta?: unknown
): ProofResponse => buildProofResponse({ status: "PENDING" })

export const liveProofResponse = (
  _result: unknown,
  _requestId?: unknown,
  _meta?: unknown
): ProofResponse => buildProofResponse({ status: "VERIFIED" })

export const cachedProofResponse = (
  _cached: unknown,
  _requestId?: unknown,
  _meta?: unknown
): ProofResponse => buildProofResponse({ status: "VERIFIED" })

