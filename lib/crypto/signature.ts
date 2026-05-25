// @ts-nocheck
import crypto from "crypto"

import {
  signHashWithA1,
  verifyHashSignatureWithA1Certificate
} from "@/lib/crypto/signWithA1"

/* =========================
   TYPES
========================= */

export type SignatureEncoding = "base64" | "hex"

export type SignHashResult = {
  signature: string
  algorithm: string
  encoding: SignatureEncoding
}

/* =========================
   HELPERS
========================= */

function normalizeHash(value?: string | null): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^0x/, "")
}

function isSha256Hex(value?: string | null): boolean {
  return /^[a-f0-9]{64}$/i.test(normalizeHash(value))
}

function sha256Hex(value: string): string {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex")
}

/* =========================
   LEGACY COMPAT
========================= */

export function signHash(
  hash: string,
  encoding: SignatureEncoding = "base64"
): SignHashResult {
  const normalized = normalizeHash(hash)

  if (!isSha256Hex(normalized)) {
    throw new Error("INVALID_SHA256_HASH")
  }

  const signed = signHashWithA1({
    hash: normalized,
    hashEncoding: "hex",
    outputEncoding: encoding
  })

  return {
    signature: signed.signature,
    algorithm: signed.algorithm,
    encoding
  }
}

export function verifySignature(
  hashOrContent: string,
  signature: string,
  encoding: SignatureEncoding = "base64"
): boolean {
  if (!signature) return false

  const hash = isSha256Hex(hashOrContent)
    ? normalizeHash(hashOrContent)
    : sha256Hex(hashOrContent)

  return verifyHashSignatureWithA1Certificate({
    hash,
    hashEncoding: "hex",
    signature,
    signatureEncoding: encoding
  })
}

/* =========================
   ALIASES
========================= */

export const sign = signHash
export const verify = verifySignature
