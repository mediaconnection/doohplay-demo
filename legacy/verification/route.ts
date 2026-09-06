import { NextRequest } from "next/server"

import { rateLimit } from "@/lib/security/rateLimit"

import { getCachedProof } from "@proof-engine/proof/cache/proofCache"
import { enqueueProof } from "@proof-engine/proof/queue/proofQueue"
import { runProofEngine } from "@proof-engine/proof/engine"

import {
  createRequestId,
  getIP,
  isJsonRequest,
  isTooLarge,
  parseJsonBody
} from "@proof-engine/domain/verification/http"

import {
  isValidHash,
  normalizeInput
} from "@proof-engine/domain/verification/validators"

import { withTimeout } from "@proof-engine/domain/verification/timeout"
import { buildProofCacheKey } from "@proof-engine/domain/verification/cacheKey"
import { ENGINE_TIMEOUT_MS } from "@proof-engine/domain/verification/constants"
import { errorResponse } from "@proof-engine/domain/verification/errors"
import {
  cachedProofResponse,
  liveProofResponse,
  queuedProofResponse,
  type RateLimitResult
} from "@proof-engine/domain/verification/proofResponse"
import { logError, logWarn } from "@proof-engine/domain/verification/logger"

export async function POST(req: NextRequest) {
  const requestId = createRequestId()

  try {
    const ip = getIP(req)
    const rl = (await rateLimit(ip)) as RateLimitResult

    if (!rl.allowed) {
      return errorResponse("RATE_LIMIT_EXCEEDED", 429, requestId, rl)
    }

    if (!isJsonRequest(req)) {
      return errorResponse("UNSUPPORTED_CONTENT_TYPE", 415, requestId, rl)
    }

    if (isTooLarge(req)) {
      return errorResponse("PAYLOAD_TOO_LARGE", 413, requestId, rl)
    }

    const raw = await parseJsonBody(req)

    if (!raw) {
      return errorResponse("INVALID_JSON", 400, requestId, rl)
    }

    const body = normalizeInput(raw)

    if (!body) {
      return errorResponse("INVALID_INPUT", 400, requestId, rl)
    }

    if (!isValidHash(body.hash)) {
      return errorResponse("INVALID_HASH_FORMAT", 400, requestId, rl)
    }

    const cacheKey = buildProofCacheKey(body)
    const cached = await getCachedProof(cacheKey)

    if (cached) {
      return cachedProofResponse(cached, requestId, rl)
    }

    try {
      const result = await withTimeout(
        () => runProofEngine(body),
        ENGINE_TIMEOUT_MS
      )

      return liveProofResponse(result, requestId, rl)
    } catch (error) {
      if (!(error instanceof Error) || error.message !== "TIMEOUT") {
        logWarn("SYNC_FAIL", { requestId, error })
      }
    }

    try {
      await enqueueProof(body)
    } catch (error) {
      logError("QUEUE_ERROR", { requestId, error })
      return errorResponse("QUEUE_FAILED", 500, requestId, rl)
    }

    return queuedProofResponse(requestId, rl)
  } catch (error) {
    logError("VERIFY_ROUTE_ERROR", { requestId, error })
    return errorResponse("INTERNAL_ERROR", 500, requestId)
  }
}