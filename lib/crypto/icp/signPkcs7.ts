// @ts-nocheck
import fs from "fs"
import forge from "node-forge"

export type SignPkcs7Input = {
  payload: string
  pfxPath?: string
  password?: string
}

export type SignPkcs7Result = {
  signature: string
  signature_algorithm: "PKCS7"
  digest_algorithm: "SHA-256"
  signature_encoding: "base64"
  signed_at: string
  certificate: {
    subject: string
    issuer: string
    serial_number: string
    fingerprint: string
    valid_from: string
    valid_to: string
  }
}

function getEnvValue(name: string): string | null {
  const value = process.env[name]?.trim()
  return value && value.length > 0 ? value : null
}

function required(value: string | null | undefined, message: string): string {
  if (!value || value.trim().length === 0) {
    throw new Error(message)
  }

  return value.trim()
}

function formatAttributes(attrs: forge.pki.CertificateField[]): string {
  return attrs
    .map((attr) => `${attr.shortName ?? attr.name}=${String(attr.value)}`)
    .join(", ")
}

function certificateFingerprint(cert: forge.pki.Certificate): string {
  const der = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes()

  return forge.md.sha256
    .create()
    .update(der)
    .digest()
    .toHex()
}

function getFirstBag<T>(
  bags: Record<string, T[] | undefined>,
  oid: string
): T | null {
  return bags[oid]?.[0] ?? null
}

export function signPkcs7(input: SignPkcs7Input): SignPkcs7Result {
  const pfxPath = required(
    input.pfxPath ?? getEnvValue("A1_PFX_PATH") ?? getEnvValue("CERT_A1_PATH"),
    "A1_PFX_PATH ou CERT_A1_PATH não configurado"
  )

  const password = required(
    input.password ??
      getEnvValue("A1_PFX_PASSWORD") ??
      getEnvValue("CERT_A1_PASSWORD"),
    "A1_PFX_PASSWORD ou CERT_A1_PASSWORD não configurado"
  )

  const payload = required(input.payload, "PAYLOAD_REQUIRED")

  const pfxBuffer = fs.readFileSync(pfxPath)
  const p12Asn1 = forge.asn1.fromDer(pfxBuffer.toString("binary"))
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password)

  const keyOid = forge.pki.oids.pkcs8ShroudedKeyBag
  const certOid = forge.pki.oids.certBag

  const keyBags = p12.getBags({
    bagType: keyOid
  }) as Record<string, forge.pkcs12.Bag[] | undefined>

  const certBags = p12.getBags({
    bagType: certOid
  }) as Record<string, forge.pkcs12.Bag[] | undefined>

  const keyBag = getFirstBag(keyBags, keyOid)
  const certBag = getFirstBag(certBags, certOid)

  if (!keyBag?.key) {
    throw new Error("PRIVATE_KEY_NOT_FOUND_IN_PFX")
  }

  if (!certBag?.cert) {
    throw new Error("CERTIFICATE_NOT_FOUND_IN_PFX")
  }

  const privateKey = keyBag.key
  const certificate = certBag.cert
  const signedAt = new Date().toISOString()

  const p7 = forge.pkcs7.createSignedData()

  p7.content = forge.util.createBuffer(payload, "utf8")

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

  const signature = forge.util.encode64(
    forge.asn1.toDer(p7.toAsn1()).getBytes()
  )

  return {
    signature,
    signature_algorithm: "PKCS7",
    digest_algorithm: "SHA-256",
    signature_encoding: "base64",
    signed_at: signedAt,
    certificate: {
      subject: formatAttributes(certificate.subject.attributes),
      issuer: formatAttributes(certificate.issuer.attributes),
      serial_number: certificate.serialNumber.toUpperCase().replace(/^0+/, ""),
      fingerprint: certificateFingerprint(certificate),
      valid_from: certificate.validity.notBefore.toISOString(),
      valid_to: certificate.validity.notAfter.toISOString()
    }
  }
}
