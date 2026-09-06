import crypto from "crypto"
import fs from "fs"
import path from "path"

export type A1LayerInput = {
  hash?: string
  event_hash?: string
  signature?: string
  signature_encoding?: string
  [key: string]: unknown
}

export type A1LayerResult = {
  name: string
  valid: boolean
  weight: number
  reasons: string[]
  message: string
  error: string | null
  details: Record<string, unknown> | null
  duration_ms: number | null
  meta: Record<string, unknown>
}

function getPublicKey(): string | null {
  try {
    const keyPath = path.resolve(process.cwd(), "keys/public.pem")
    if (!fs.existsSync(keyPath)) return null
    return fs.readFileSync(keyPath, "utf8")
  } catch {
    return null
  }
}

function verifyRsa(eventHash: string, signature: string): boolean {
  const publicKey = getPublicKey()
  if (!publicKey) return false

  const verify = crypto.createVerify("RSA-SHA256")
  // pdfSigner.ts signs with: sign.update(Buffer.from(hash, "hex"))
  verify.update(Buffer.from(eventHash.replace(/^0x/, ""), "hex"))
  return verify.verify(publicKey, signature, "base64")
}

export async function a1SignatureLayer(
  input: A1LayerInput
): Promise<A1LayerResult> {
  const eventHash = ((input.event_hash ?? input.hash ?? "") as string)
    .trim()
    .replace(/^0x/, "")
  const signature = ((input.signature ?? "") as string).trim()

  // No signature stored — ICP is optional, no penalty applied
  if (!signature || !eventHash) {
    return {
      name: "icp",
      valid: false,
      weight: 40,
      reasons: [],
      message: "Assinatura RSA não presente — camada ICP opcional",
      error: null,
      details: { signature_present: false, optional: true },
      duration_ms: null,
      meta: { signature_present: false, optional: true }
    }
  }

  // Public key not found — treat as unconfigured, no penalty
  if (!getPublicKey()) {
    return {
      name: "icp",
      valid: false,
      weight: 40,
      reasons: [],
      message: "Chave pública não encontrada em keys/public.pem — ICP opcional",
      error: null,
      details: { signature_present: true, key_found: false, optional: true },
      duration_ms: null,
      meta: { key_found: false, optional: true }
    }
  }

  try {
    const valid = verifyRsa(eventHash, signature)

    return {
      name: "icp",
      valid,
      weight: 40,
      reasons: valid ? [] : ["INVALID_SIGNATURE"],
      message: valid
        ? "Assinatura RSA-SHA256 válida"
        : "Assinatura RSA-SHA256 inválida",
      error: valid ? null : "INVALID_SIGNATURE",
      details: {
        signature_present: true,
        key_found: true,
        signature_algorithm: "RSA-SHA256",
        signature_encoding: "base64",
      },
      duration_ms: null,
      meta: { signature_present: true, signature_algorithm: "RSA-SHA256" }
    }
  } catch (err) {
    // Verification threw (malformed key/sig) — treat as unconfigured, no penalty
    return {
      name: "icp",
      valid: false,
      weight: 40,
      reasons: [],
      message: "Erro ao verificar assinatura RSA — ICP opcional",
      error: err instanceof Error ? err.message : "VERIFY_ERROR",
      details: { signature_present: true, optional: true },
      duration_ms: null,
      meta: { optional: true }
    }
  }
}
