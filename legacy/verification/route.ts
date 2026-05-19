import { NextRequest } from "next/server"

import { rateLimit } from "@/lib/security/rateLimit"

import { getCachedProof } from "@/lib/proof/cache/proofCache"
import { enqueueProof } from "@/lib/proof/queue/proofQueue"
import { runProofEngine } from "@/lib/proof/engine"

import {
  createRequestId,
  getIP,
  isJsonRequest,
  isTooLarge,
  parseJsonBody
} from "@/lib/domain/verification/http"

import {
  isValidHash,
  normalizeInput
} from "@/lib/domain/verification/validators"

import { withTimeout } from "@/lib/domain/verification/timeout"
import { buildProofCacheKey } from "@/lib/domain/verification/cacheKey"
import { ENGINE_TIMEOUT_MS } from "@/lib/domain/verification/constants"
import { errorResponse } from "@/lib/domain/verification/errors"
import {
  cachedProofResponse,
  liveProofResponse,
  queuedProofResponse,
  type RateLimitResult
} from "@/lib/domain/verification/proofResponse"
import { logError, logWarn } from "@/lib/domain/verification/logger"

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