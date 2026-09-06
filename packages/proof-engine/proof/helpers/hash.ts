// @ts-nocheck
import crypto from "crypto"

export function sha256Hex(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex")
}

export function normalizeHex(value: string): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^0x/, "")
}

export function isSha256Hex(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(normalizeHex(value))
}
