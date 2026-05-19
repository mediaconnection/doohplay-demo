import fs from "fs"
import forge from "node-forge"

type A1SignatureResult = {
  signedHash: string
  certificateSerial: string
  certificateAuthority: string
}

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`${name} não configurado`)
  }

  return value
}

function getFirstBag<T>(
  bags: Record<string, T[] | undefined>,
  oid: string
): T | null {
  return bags[oid]?.[0] ?? null
}

function formatCertificateAuthority(
  certificate: forge.pki.Certificate
): string {
  return certificate.issuer.attributes
    .map((attr) => `${attr.shortName ?? attr.name}=${String(attr.value)}`)
    .join(", ")
}

export function assinarComA1(hash: string): A1SignatureResult {
  const pfxPath = getRequiredEnv("CERT_A1_PATH")
  const password = getRequiredEnv("CERT_A1_PASSWORD")

  const pfxBuffer = fs.readFileSync(pfxPath)
  const p12Asn1 = forge.asn1.fromDer(pfxBuffer.toString("binary"))
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password)

  const keyOid = forge.pki.oids.pkcs8ShroudedKeyBag
  const certOid = forge.pki.oids.certBag

  const keyBags = p12.getBags({
    bagType: keyOid
  }) as Record<string, forge.pkcs12.Bag[] | undefined>

  const keyBag = getFirstBag(keyBags, keyOid)

  if (!keyBag?.key) {
    throw new Error("Chave privada não encontrada no certificado A1")
  }

  const certBags = p12.getBags({
    bagType: certOid
  }) as Record<string, forge.pkcs12.Bag[] | undefined>

  const certBag = getFirstBag(certBags, certOid)

  if (!certBag?.cert) {
    throw new Error("Certificado não encontrado no A1")
  }

  const privateKey = keyBag.key
  const certificate = certBag.cert

  const p7 = forge.pkcs7.createSignedData()
  p7.content = forge.util.createBuffer(hash, "utf8")

  p7.addCertificate(certificate)
  p7.addSigner({
    key: privateKey,
    certificate,
    digestAlgorithm: forge.pki.oids.sha256
  })

  p7.sign({ detached: true })

  const signedHash = forge.util.encode64(
    forge.asn1.toDer(p7.toAsn1()).getBytes()
  )

  const certificateSerial = certificate.serialNumber
    .toUpperCase()
    .replace(/^0+/, "")

  const certificateAuthority = formatCertificateAuthority(certificate)

  return {
    signedHash,
    certificateSerial,
    certificateAuthority
  }
}