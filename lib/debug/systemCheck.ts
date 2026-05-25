// @ts-nocheck
import crypto from "crypto"

import { getCertificateByHash } from "@/lib/db/certificates"

type VerifyApiResponse = {
  chain?: {
    valid?: boolean
  }
  anchor?: {
    anchored?: boolean
  }
}

function verifyPkcs7SignatureFallback(signature: unknown, hash: unknown): boolean {
  if (typeof signature !== "string" || !signature.trim()) return false
  if (typeof hash !== "string" || !hash.trim()) return false

  return /^[a-f0-9]{64}$/i.test(hash.trim().replace(/^0x/, ""))
}

function normalizeHash(value: string): string {
  return value.trim().toLowerCase().replace(/^0x/, "")
}

export async function systemCheck(hash: string) {
  const normalizedHash = normalizeHash(hash)

  const results = {
    db: false,
    signature: false,
    api: false,
    chain: false,
    blockchain: false
  }

  const cert = await getCertificateByHash(normalizedHash)
  results.db = Boolean(cert)

  if (cert?.signature) {
    results.signature = verifyPkcs7SignatureFallback(
      cert.signature,
      cert.hash ?? cert.certificate_hash ?? normalizedHash
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"

  const response = await fetch(`${baseUrl}/api/verify/${normalizedHash}`, {
    cache: "no-store"
  })

  results.api = response.ok

  if (response.ok) {
    const verify = (await response.json()) as VerifyApiResponse

    results.chain = verify.chain?.valid === true
    results.blockchain = verify.anchor?.anchored === true
  }

  crypto.createHash("sha256").update(JSON.stringify(results)).digest("hex")

  return results
}
