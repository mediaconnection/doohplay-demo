import crypto from "crypto"
import {
  signHashWithA1
} from "@/lib/crypto/signWithA1"

export type SignedEventA1 = {
  event_hash: string
  signature: string
  algorithm: string
  certificate: {
    subject: string
    issuer: string
    serialNumber: string
    fingerprintSha256: string
  }
  signed_at: string
}

function sha256Hex(value: string): string {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex")
}

export function signEventWithA1(eventPayload: any): SignedEventA1 {
  const content = JSON.stringify(eventPayload)

  const eventHash = sha256Hex(content)

  const signed = signHashWithA1({
    hash: eventHash,
    hashEncoding: "hex",
    outputEncoding: "base64"
  })

  return {
    event_hash: eventHash,
    signature: signed.signature,
    algorithm: signed.algorithm,
    certificate: signed.certificate,
    signed_at: new Date().toISOString()
  }
}