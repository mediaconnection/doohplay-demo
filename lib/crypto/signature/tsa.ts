// @ts-nocheck
import { tsaEnv } from "@/lib/config/env"
import { sha256Hex } from "./hash"
import type { TimestampTokenResult } from "./types"

type RequestTimestampInput = {
  digest_hex: string
  tsa_url?: string
  timeout_ms?: number
}

function getTsaUrl(override?: string): string {
  return override ?? tsaEnv.url
}

function getTimeoutMs(override?: number): number {
  return typeof override === "number" && Number.isFinite(override)
    ? override
    : tsaEnv.timeoutMs
}

function hexToUint8Array(hex: string): Uint8Array {
  return Uint8Array.from(Buffer.from(hex, "hex"))
}

function bytesToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64")
}

function uint8ArrayToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const arrayBuffer = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(arrayBuffer).set(bytes)
  return arrayBuffer
}

function buildTimestampRequestFromDigest(digestHex: string): ArrayBuffer {
  return uint8ArrayToArrayBuffer(hexToUint8Array(digestHex))
}

function parseTimestampResponse(
  responseBytes: Uint8Array,
  tsaUrl: string,
  digestHex: string
): TimestampTokenResult {
  const now = new Date().toISOString()

  return {
    provider: "RFC3161",
    tsa_url: tsaUrl,
    token_base64: bytesToBase64(responseBytes),
    serial_number: null,
    gen_time: now,
    policy_oid: null,
    digest_hex: digestHex,
    created_at: now
  }
}

export async function requestTimestampToken(
  input: RequestTimestampInput
): Promise<TimestampTokenResult> {
  const tsaUrl = getTsaUrl(input.tsa_url)
  const timeoutMs = getTimeoutMs(input.timeout_ms)

  const digestHex = input.digest_hex.trim().toLowerCase()

  if (!/^[a-f0-9]{64}$/.test(digestHex)) {
    throw new Error("INVALID_DIGEST_HEX")
  }

  const requestBody: BodyInit = buildTimestampRequestFromDigest(digestHex)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(tsaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/timestamp-query",
        Accept: "application/timestamp-reply"
      },
      body: requestBody,
      signal: controller.signal
    })

    if (!res.ok) {
      throw new Error(`TSA_HTTP_${res.status}`)
    }

    const responseArrayBuffer = await res.arrayBuffer()
    const responseBytes = new Uint8Array(responseArrayBuffer)

    if (responseBytes.byteLength === 0) {
      throw new Error("EMPTY_TSA_RESPONSE")
    }

    return parseTimestampResponse(responseBytes, tsaUrl, digestHex)
  } finally {
    clearTimeout(timeout)
  }
}

export async function requestTimestampForSignature(
  signatureBase64: string,
  tsaUrl?: string
): Promise<TimestampTokenResult> {
  const digest_hex = sha256Hex(Buffer.from(signatureBase64, "base64"))

  return requestTimestampToken({
    digest_hex,
    tsa_url: tsaUrl
  })
}
