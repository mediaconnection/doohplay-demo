import { NextRequest } from "next/server"

import { MAX_BODY_SIZE } from "./constants"

export type RawInput = Record<string, unknown>

export type RateLimitResult = {
  limit?: number
  remaining?: number
  reset?: number
  allowed?: boolean
}

export function getIP(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for")
  const realIp = req.headers.get("x-real-ip")

  const ip =
    forwardedFor?.split(",")[0]?.trim() ||
    realIp?.trim() ||
    "unknown"

  return ip.replace(/^::ffff:/, "")
}

export function getContentType(req: NextRequest): string {
  return req.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ?? ""
}

export function isJsonRequest(req: NextRequest): boolean {
  return getContentType(req) === "application/json"
}

export function isTooLarge(req: NextRequest): boolean {
  const contentLength = req.headers.get("content-length")
  if (!contentLength) return false

  const size = Number(contentLength)
  if (!Number.isFinite(size) || size < 0) return true

  return size > MAX_BODY_SIZE
}

export async function parseJsonBody(req: NextRequest): Promise<RawInput | null> {
  try {
    const rawText = await req.text()

    if (!rawText.trim()) return null
    if (new TextEncoder().encode(rawText).length > MAX_BODY_SIZE) return null

    const parsed = JSON.parse(rawText)

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null
    }

    return parsed as RawInput
  } catch {
    return null
  }
}

export function rateHeaders(rl: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(rl.remaining ?? 0),
    "X-RateLimit-Reset": String(rl.reset ?? 0)
  }
}

export function responseHeaders(
  rl: RateLimitResult,
  requestId: string
): Record<string, string> {
  return {
    ...rateHeaders(rl),
    "X-Request-ID": requestId,
    "Cache-Control": "no-store"
  }
}

export function fallbackHeaders(requestId: string): Record<string, string> {
  return {
    "X-Request-ID": requestId,
    "Cache-Control": "no-store"
  }
}

export function createRequestId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return Math.random().toString(36).slice(2)
  }
}