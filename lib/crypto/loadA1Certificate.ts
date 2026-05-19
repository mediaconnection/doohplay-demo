import fs from "fs"
import path from "path"
import crypto from "crypto"
import forge from "node-forge"

export type A1CertificateMode = "MOCK" | "REAL"

export type A1CertificateInfo = {
  subject: string
  issuer: string
  serialNumber: string
  fingerprintSha256: string
  validFrom: string | null
  validTo: string | null
  daysRemaining: number | null
}

export type LoadedA1Certificate = {
  cert: forge.pki.Certificate | null
  privateKey: forge.pki.PrivateKey | null
  info: A1CertificateInfo
  resolvedPath: string | null
  mode: A1CertificateMode
}

/* =========================
   MOCK
========================= */

function createMockCertificate(): LoadedA1Certificate {
  const subject = process.env.A1_CERT_SUBJECT || "CN=DOOHPLAY DEV A1"

  return {
    cert: null,
    privateKey: null,
    resolvedPath: null,
    mode: "MOCK",
    info: {
      subject,
      issuer: process.env.A1_CERT_ISSUER || "CN=DOOHPLAY INTERNAL CA",
      serialNumber: process.env.A1_CERT_SERIAL || "DOOHPLAY-DEV-A1-001",
      fingerprintSha256: crypto
        .createHash("sha256")
        .update(subject)
        .digest("hex")
        .toUpperCase(),
      validFrom: null,
      validTo: null,
      daysRemaining: null
    }
  }
}

/* =========================
   HELPERS
========================= */

function dnToString(
  dn:
    | forge.pki.CertificateField
    | forge.pki.Certificate["issuer"]
    | forge.pki.Certificate["subject"]
): string {
  const attrs = (dn as any)?.attributes

  if (!Array.isArray(attrs)) return "—"

  return attrs
    .map((attr: any) => {
      const key = attr.shortName || attr.name || attr.type || "attr"
      return `${key}=${attr.value}`
    })
    .join(", ")
}

function formatSerial(serialHex: string): string {
  if (!serialHex?.trim()) return "—"

  return (
    serialHex
      .toUpperCase()
      .match(/.{1,2}/g)
      ?.join(":") ?? serialHex.toUpperCase()
  )
}

function sha256FingerprintFromCertificate(
  cert: forge.pki.Certificate
): string {
  const asn1 = forge.pki.certificateToAsn1(cert)
  const derBytes = forge.asn1.toDer(asn1).getBytes()

  const md = forge.md.sha256.create()
  md.update(derBytes)

  const hex = md.digest().toHex().toUpperCase()

  return hex.match(/.{1,2}/g)?.join(":") ?? hex
}

function daysUntil(date: Date): number | null {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null

  return Math.floor(
    (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
}

function getBagsSafe(
  p12: forge.pkcs12.Pkcs12Pfx,
  bagType: string
): any[] {
  const bags = p12.getBags({ bagType })
  return bags?.[bagType] ?? []
}

function getBagAttribute(
  bag: any,
  attributeName: string
): string | null {
  const attrs = bag?.attributes?.[attributeName]

  if (!Array.isArray(attrs) || attrs.length === 0) return null

  const value = attrs[0]

  if (typeof value === "string") return value

  try {
    return forge.util.bytesToHex(value)
  } catch {
    return null
  }
}

function findMatchingCertBag(certBags: any[], keyBags: any[]) {
  if (!certBags.length) return null
  if (!keyBags.length) return certBags[0]

  const keyLocalKeyIds = new Set(
    keyBags
      .map((bag) => getBagAttribute(bag, "localKeyId"))
      .filter((v): v is string => Boolean(v))
  )

  const matched = certBags.find((bag) => {
    const localKeyId = getBagAttribute(bag, "localKeyId")
    return !!localKeyId && keyLocalKeyIds.has(localKeyId)
  })

  return matched ?? certBags[0]
}

/* =========================
   PUBLIC API
========================= */

export function loadA1CertificateFromEnv(): LoadedA1Certificate {
  const pfxPath = process.env.A1_PFX_PATH
  const pfxPassword = process.env.A1_PFX_PASSWORD

  /**
   * DEV MODE:
   * Não quebra o build/teste quando A1 real ainda não está configurado.
   */
  if (!pfxPath || pfxPassword === undefined) {
    return createMockCertificate()
  }

  return loadA1Certificate({
    pfxPath,
    password: pfxPassword
  })
}

export function loadA1Certificate(input: {
  pfxPath: string
  password: string
}): LoadedA1Certificate {
  const resolvedPath = path.resolve(input.pfxPath)

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Arquivo do certificado não encontrado: ${resolvedPath}`)
  }

  const pfxBuffer = fs.readFileSync(resolvedPath)

  if (!Buffer.isBuffer(pfxBuffer) || pfxBuffer.length === 0) {
    throw new Error("Arquivo PFX vazio ou inválido")
  }

  const p12Der = forge.util.createBuffer(pfxBuffer.toString("binary"))
  const p12Asn1 = forge.asn1.fromDer(p12Der)

  const p12 = forge.pkcs12.pkcs12FromAsn1(
    p12Asn1,
    false,
    input.password
  )

  const certBags = getBagsSafe(p12, forge.pki.oids.certBag)

  const keyBags = [
    ...getBagsSafe(p12, forge.pki.oids.pkcs8ShroudedKeyBag),
    ...getBagsSafe(p12, forge.pki.oids.keyBag)
  ]

  if (certBags.length === 0) {
    throw new Error("Nenhum certificado encontrado dentro do PFX")
  }

  if (keyBags.length === 0) {
    throw new Error("Nenhuma chave privada encontrada dentro do PFX")
  }

  const certBag = findMatchingCertBag(certBags, keyBags)
  const cert = certBag?.cert ?? null
  const privateKey = keyBags[0]?.key ?? null

  if (!cert) {
    throw new Error("Certificado principal não encontrado dentro do PFX")
  }

  if (!privateKey) {
    throw new Error("Chave privada principal não encontrada dentro do PFX")
  }

  return {
    cert,
    privateKey,
    resolvedPath,
    mode: "REAL",
    info: {
      subject: dnToString(cert.subject),
      issuer: dnToString(cert.issuer),
      serialNumber: formatSerial(cert.serialNumber),
      fingerprintSha256: sha256FingerprintFromCertificate(cert),
      validFrom: cert.validity.notBefore.toISOString(),
      validTo: cert.validity.notAfter.toISOString(),
      daysRemaining: daysUntil(cert.validity.notAfter)
    }
  }
}