// @ts-nocheck
import fs from "fs"
import forge from "node-forge"

export type PKCS7SignResult = {
  signature: string
  certificateSerial: string
  issuer: string
  subject: string
  algorithm: string
  signedAt: string
}

type Pkcs12Bag = forge.pkcs12.Bag & {
  key?: forge.pki.rsa.PrivateKey
  cert?: forge.pki.Certificate
}

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`${name} não configurado`)
  }

  return value
}

function loadP12(): forge.pkcs12.Pkcs12Pfx {
  const pfxPath = getRequiredEnv("CERT_PFX_PATH")
  const password = getRequiredEnv("CERT_PFX_PASSWORD")

  const pfxBuffer = fs.readFileSync(pfxPath)

  const p12Asn1 = forge.asn1.fromDer(
    forge.util.createBuffer(pfxBuffer.toString("binary"))
  )

  return forge.pkcs12.pkcs12FromAsn1(p12Asn1, password)
}

function getFirstBag<T>(
  bags: Record<string, T[] | undefined>,
  oid: string
): T | null {
  return bags[oid]?.[0] ?? null
}

function extractCredentials(p12: forge.pkcs12.Pkcs12Pfx): {
  privateKey: forge.pki.rsa.PrivateKey
  certificate: forge.pki.Certificate
} {
  const keyOid = forge.pki.oids.pkcs8ShroudedKeyBag
  const certOid = forge.pki.oids.certBag

  const keyBags = p12.getBags({
    bagType: keyOid
  }) as Record<string, Pkcs12Bag[] | undefined>

  const certBags = p12.getBags({
    bagType: certOid
  }) as Record<string, Pkcs12Bag[] | undefined>

  const keyBag = getFirstBag(keyBags, keyOid)
  const certBag = getFirstBag(certBags, certOid)

  if (!keyBag?.key) {
    throw new Error("Chave privada não encontrada no PFX")
  }

  if (!certBag?.cert) {
    throw new Error("Certificado não encontrado no PFX")
  }

  return {
    privateKey: keyBag.key,
    certificate: certBag.cert
  }
}

function formatAttributes(attributes: forge.pki.CertificateField[]): string {
  return attributes
    .map((attr) => `${attr.shortName ?? attr.name}=${String(attr.value)}`)
    .join(", ")
}

function normalizeHashHex(hashHex: string): string {
  const normalized = hashHex.trim().toLowerCase().replace(/^0x/, "")

  if (!/^[a-f0-9]{64}$/i.test(normalized)) {
    throw new Error("hashHex inválido")
  }

  return normalized
}

export function pkcs7Sign(hashHex: string): PKCS7SignResult {
  const normalizedHash = normalizeHashHex(hashHex)

  const p12 = loadP12()
  const { privateKey, certificate } = extractCredentials(p12)

  const hashBytes = forge.util.hexToBytes(normalizedHash)
  const signedAt = new Date().toISOString()

  const p7 = forge.pkcs7.createSignedData()

  p7.content = forge.util.createBuffer(hashBytes)
  p7.addCertificate(certificate)

  p7.addSigner({
    key: privateKey,
    certificate,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      {
        type: forge.pki.oids.contentType,
        value: forge.pki.oids.data
      },
      {
        type: forge.pki.oids.messageDigest
      },
      {
        type: forge.pki.oids.signingTime,
        value: signedAt
      }
    ]
  })

  p7.sign({ detached: true })

  const der = forge.asn1.toDer(p7.toAsn1()).getBytes()
  const signature = forge.util.encode64(der)

  return {
    signature,
    certificateSerial: certificate.serialNumber,
    issuer: formatAttributes(certificate.issuer.attributes),
    subject: formatAttributes(certificate.subject.attributes),
    algorithm: "PKCS7-SHA256",
    signedAt
  }
}
