import fs from "fs"
import forge from "node-forge"
import { createSign, createPrivateKey, X509Certificate } from "crypto"

import { canonicalDigest } from "../hash"
import type {
  SignatureAlgorithm,
  SignatureInput,
  SignatureMaterial
} from "../types"

type PfxMaterial = {
  privateKeyPem: string
  certificatePem: string | null
  certificateChainPem: string[] | null
  publicKeyPem: string | null
}

function pemFromForgeCert(cert: forge.pki.Certificate): string {
  return forge.pki.certificateToPem(cert)
}

function pemFromForgePrivateKey(key: forge.pki.PrivateKey): string {
  return forge.pki.privateKeyToPem(key)
}

function safeBagArray<T>(value: T[] | undefined): T[] {
  return Array.isArray(value) ? value : []
}

function readPfxFile(filePath: string): Buffer {
  if (!filePath?.trim()) {
    throw new Error("CERT_PFX_PATH_NOT_CONFIGURED")
  }

  if (!fs.existsSync(filePath)) {
    throw new Error("CERT_PFX_FILE_NOT_FOUND")
  }

  return fs.readFileSync(filePath)
}

function extractPfxMaterial(
  pfxBuffer: Buffer,
  password: string
): PfxMaterial {
  const binary = pfxBuffer.toString("binary")
  const asn1 = forge.asn1.fromDer(binary)
  const p12 = forge.pkcs12.pkcs12FromAsn1(asn1, false, password)

  const keyBags =
    safeBagArray(
      p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[
        forge.pki.oids.pkcs8ShroudedKeyBag
      ]
    )

  const fallbackKeyBags =
    safeBagArray(
      p12.getBags({ bagType: forge.pki.oids.keyBag })[
        forge.pki.oids.keyBag
      ]
    )

  const certBags =
    safeBagArray(
      p12.getBags({ bagType: forge.pki.oids.certBag })[
        forge.pki.oids.certBag
      ]
    )

  const keyBag = keyBags[0] ?? fallbackKeyBags[0]

  if (!keyBag?.key) {
    throw new Error("PFX_PRIVATE_KEY_NOT_FOUND")
  }

  const privateKeyPem = pemFromForgePrivateKey(keyBag.key)

  const certificates = certBags
    .map((bag) => bag.cert)
    .filter((cert): cert is forge.pki.Certificate => Boolean(cert))

  const certificatePem = certificates[0]
    ? pemFromForgeCert(certificates[0])
    : null

  const certificateChainPem =
    certificates.length > 0
      ? certificates.map((cert) => pemFromForgeCert(cert))
      : null

  let publicKeyPem: string | null = null

  if (certificatePem) {
    try {
      const x509 = new X509Certificate(certificatePem)
      publicKeyPem = x509.publicKey.export({
        format: "pem",
        type: "spki"
      }).toString()
    } catch {
      publicKeyPem = null
    }
  }

  return {
    privateKeyPem,
    certificatePem,
    certificateChainPem,
    publicKeyPem
  }
}

function resolveAlgorithm(
  algorithm?: SignatureAlgorithm
): SignatureAlgorithm {
  if (algorithm) return algorithm
  return "RSA-SHA256"
}

export function signCanonicalPayloadWithPfx(
  input: SignatureInput,
  options?: {
    pfxPath?: string
    pfxPassword?: string
    algorithm?: SignatureAlgorithm
  }
): SignatureMaterial & {
  canonical: string
  public_key_pem?: string | null
} {
  const pfxPath = options?.pfxPath ?? process.env.CERT_PFX_PATH
  const pfxPassword = options?.pfxPassword ?? process.env.CERT_PFX_PASSWORD

  if (!pfxPath?.trim()) {
    throw new Error("CERT_PFX_PATH_NOT_CONFIGURED")
  }

  if (typeof pfxPassword !== "string") {
    throw new Error("CERT_PFX_PASSWORD_NOT_CONFIGURED")
  }

  const algorithm = resolveAlgorithm(options?.algorithm)
  const { canonical, digest_hex } = canonicalDigest(input.payload)

  const pfxBuffer = readPfxFile(pfxPath)
  const material = extractPfxMaterial(pfxBuffer, pfxPassword)

  const privateKey = createPrivateKey(material.privateKeyPem)

  const signer = createSign(algorithm)
  signer.update(canonical)
  signer.end()

  const signature_base64 = signer.sign(privateKey, "base64")

  return {
    algorithm,
    signature_base64,
    digest_hex,
    signed_at: new Date().toISOString(),
    certificate_pem: material.certificatePem,
    certificate_chain_pem: material.certificateChainPem,
    public_key_pem: material.publicKeyPem,
    canonical
  }
}