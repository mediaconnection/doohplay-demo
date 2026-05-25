// @ts-nocheck
import { createSign } from "crypto"
import { canonicalDigest } from "./hash"
import { signCanonicalPayloadWithPfx } from "./adapters/pfxSigner"
import { signingEnv } from "@/lib/config/env"
import type {
  SignatureAlgorithm,
  SignatureInput,
  SignatureMaterial
} from "./types"

const DEFAULT_ALGORITHM: SignatureAlgorithm = "RSA-SHA256"

function getPrivateKeyPem(): string {
  if (!signingEnv.privateKeyPem) {
    throw new Error("SIGNING_PRIVATE_KEY_PEM_NOT_CONFIGURED")
  }

  return signingEnv.privateKeyPem
}

function getCertificatePem(): string | null {
  return signingEnv.certificatePem ?? null
}

function getCertificateChainPem(): string[] | null {
  const raw = signingEnv.certificateChainPem
  if (!raw?.trim()) return null

  return raw
    .split("\n---CHAIN---\n")
    .map((item) => item.trim())
    .filter(Boolean)
}

function getSigningMode(): "pem" | "pfx" {
  return signingEnv.mode === "pfx" ? "pfx" : "pem"
}

export function signCanonicalPayload(
  input: SignatureInput,
  algorithm: SignatureAlgorithm = DEFAULT_ALGORITHM
): SignatureMaterial & {
  canonical: string
  public_key_pem?: string | null
} {
  const mode = getSigningMode()

  if (mode === "pfx") {
    return signCanonicalPayloadWithPfx(input, {
      pfxPath: signingEnv.pfxPath ?? undefined,
      pfxPassword: signingEnv.pfxPassword ?? undefined,
      algorithm
    })
  }

  const { canonical, digest_hex } = canonicalDigest(input.payload)
  const privateKeyPem = getPrivateKeyPem()

  const signer = createSign(algorithm)
  signer.update(canonical)
  signer.end()

  const signature_base64 = signer.sign(privateKeyPem, "base64")

  return {
    algorithm,
    signature_base64,
    digest_hex,
    signed_at: new Date().toISOString(),
    certificate_pem: getCertificatePem(),
    certificate_chain_pem: getCertificateChainPem(),
    public_key_pem: null,
    canonical
  }
}
