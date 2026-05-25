// @ts-nocheck
import crypto from "crypto"
import forge from "node-forge"

import { loadA1CertificateFromEnv } from "@/lib/crypto/loadA1Certificate"

type Encoding = BufferEncoding | "base64" | "hex"

type ForgeRsaPrivateKey = forge.pki.rsa.PrivateKey
type ForgeRsaPublicKey = forge.pki.rsa.PublicKey

export type CertificateInfo = {
  subject: string
  issuer: string
  serialNumber: string
  fingerprintSha256: string
  validFrom?: string | null
  validTo?: string | null
  daysRemaining?: number | null
}

export type SignedA1Result = {
  signature: string
  algorithm: string
  certificate: CertificateInfo
  mode: "MOCK" | "REAL"
}

export type SignContentInput = {
  content: string
  inputEncoding?: BufferEncoding
  outputEncoding?: Encoding
  allowMock?: boolean
}

export type SignHashInput = {
  hash: string
  hashEncoding?: BufferEncoding
  outputEncoding?: Encoding
  allowMock?: boolean
}

export type VerifyContentInput = {
  content: string
  signature: string
  contentEncoding?: BufferEncoding
  signatureEncoding?: Encoding
  allowMock?: boolean
}

export type VerifyHashInput = {
  hash: string
  hashEncoding?: BufferEncoding
  signature: string
  signatureEncoding?: Encoding
  allowMock?: boolean
}

const MOCK_SECRET =
  process.env.A1_MOCK_PRIVATE_KEY || "doohplay-dev-a1-private-key"

const DEFAULT_ALLOW_MOCK =
  process.env.NODE_ENV !== "production" || process.env.A1_ALLOW_MOCK === "true"

function normalizeHash(value: string): string {
  return String(value || "").trim().toLowerCase().replace(/^0x/, "")
}

function isSha256Hex(value: string): boolean {
  return /^[a-f0-9]{64}$/.test(normalizeHash(value))
}

function encode(buffer: Buffer, encoding: Encoding = "base64"): string {
  return buffer.toString(encoding as BufferEncoding)
}

function decode(value: string, encoding: Encoding = "base64"): Buffer {
  return Buffer.from(value, encoding as BufferEncoding)
}

function safeEqual(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

function mockSign(buffer: Buffer): Buffer {
  return crypto.createHmac("sha256", MOCK_SECRET).update(buffer).digest()
}

function assertMockAllowed(allowMock?: boolean): void {
  const allowed = allowMock ?? DEFAULT_ALLOW_MOCK

  if (!allowed) {
    throw new Error("A1_REAL_REQUIRED_BUT_NOT_AVAILABLE")
  }
}

function certificateInfo(): CertificateInfo {
  const loaded = loadA1CertificateFromEnv()

  return {
    subject: loaded.info.subject,
    issuer: loaded.info.issuer,
    serialNumber: loaded.info.serialNumber,
    fingerprintSha256: loaded.info.fingerprintSha256,
    validFrom: loaded.info.validFrom,
    validTo: loaded.info.validTo,
    daysRemaining: loaded.info.daysRemaining
  }
}

function isForgeRsaPrivateKey(value: unknown): value is ForgeRsaPrivateKey {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof (value as { sign?: unknown }).sign === "function"
  )
}

function isForgeRsaPublicKey(value: unknown): value is ForgeRsaPublicKey {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof (value as { verify?: unknown }).verify === "function"
  )
}

function signRealBuffer(buffer: Buffer): Buffer {
  const loaded = loadA1CertificateFromEnv()

  if (loaded.mode !== "REAL" || !isForgeRsaPrivateKey(loaded.privateKey)) {
    throw new Error("A1_PRIVATE_KEY_NOT_AVAILABLE")
  }

  const md = forge.md.sha256.create()
  md.update(buffer.toString("binary"))

  return Buffer.from(loaded.privateKey.sign(md), "binary")
}

function verifyRealBuffer(buffer: Buffer, signature: Buffer): boolean {
  const loaded = loadA1CertificateFromEnv()

  const publicKey = loaded.cert?.publicKey

  if (loaded.mode !== "REAL" || !isForgeRsaPublicKey(publicKey)) {
    throw new Error("A1_CERTIFICATE_NOT_AVAILABLE")
  }

  const md = forge.md.sha256.create()
  md.update(buffer.toString("binary"))

  return publicKey.verify(md.digest().bytes(), signature.toString("binary"))
}

function getMode(): "MOCK" | "REAL" {
  return loadA1CertificateFromEnv().mode
}

export function signWithA1(input: SignContentInput): SignedA1Result {
  if (!input.content || typeof input.content !== "string") {
    throw new Error("INVALID_CONTENT")
  }

  const payload = Buffer.from(input.content, input.inputEncoding || "utf8")
  const mode = getMode()

  if (mode !== "REAL") {
    assertMockAllowed(input.allowMock)
  }

  const signature = mode === "REAL" ? signRealBuffer(payload) : mockSign(payload)

  return {
    signature: encode(signature, input.outputEncoding || "base64"),
    algorithm:
      mode === "REAL" ? "ICP-BRASIL-A1-RSA-SHA256" : "MOCK-A1-HMAC-SHA256",
    certificate: certificateInfo(),
    mode
  }
}

export function signHashWithA1(input: SignHashInput): SignedA1Result {
  const hash = normalizeHash(input.hash)

  if (!isSha256Hex(hash)) {
    throw new Error("INVALID_SHA256_HASH")
  }

  const payload = Buffer.from(hash, "hex")
  const mode = getMode()

  if (mode !== "REAL") {
    assertMockAllowed(input.allowMock)
  }

  const signature = mode === "REAL" ? signRealBuffer(payload) : mockSign(payload)

  return {
    signature: encode(signature, input.outputEncoding || "base64"),
    algorithm:
      mode === "REAL" ? "ICP-BRASIL-A1-RSA-SHA256" : "MOCK-A1-HMAC-SHA256",
    certificate: certificateInfo(),
    mode
  }
}

export function verifySignatureWithA1Certificate(
  input: VerifyContentInput
): boolean {
  try {
    if (!input.content || !input.signature) return false

    const payload = Buffer.from(input.content, input.contentEncoding || "utf8")
    const signature = decode(input.signature, input.signatureEncoding || "base64")
    const mode = getMode()

    if (mode === "REAL") {
      return verifyRealBuffer(payload, signature)
    }

    assertMockAllowed(input.allowMock)
    return safeEqual(mockSign(payload), signature)
  } catch {
    return false
  }
}

export function verifyHashSignatureWithA1Certificate(
  input: VerifyHashInput
): boolean {
  try {
    const hash = normalizeHash(input.hash)

    if (!isSha256Hex(hash) || !input.signature) return false

    const payload = Buffer.from(hash, "hex")
    const signature = decode(input.signature, input.signatureEncoding || "base64")
    const mode = getMode()

    if (mode === "REAL") {
      return verifyRealBuffer(payload, signature)
    }

    assertMockAllowed(input.allowMock)
    return safeEqual(mockSign(payload), signature)
  } catch {
    return false
  }
}

export const signContentWithA1 = signWithA1
export const verifyContentSignatureWithA1Certificate =
  verifySignatureWithA1Certificate
