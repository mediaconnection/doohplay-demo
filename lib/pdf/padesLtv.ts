import forge from "node-forge"

type LtvInput = {
  signatureBase64: string
  certificatePem: string
  chainPem: string[]
  ocspResponse?: string
  crl?: string
  tsaToken?: string
}

type Pkcs7LtvLike = {
  certificates?: forge.pki.Certificate[]
  rawCapture?: Record<string, unknown>
  toAsn1?: () => forge.asn1.Asn1
}

function decodeBase64(value: string): string {
  return forge.util.decode64(value)
}

export function buildLtvSignature({
  signatureBase64,
  certificatePem,
  chainPem,
  ocspResponse,
  crl,
  tsaToken
}: LtvInput): string {
  const der = decodeBase64(signatureBase64)
  const asn1 = forge.asn1.fromDer(der)

  const p7 = forge.pkcs7.messageFromAsn1(asn1) as Pkcs7LtvLike

  const certificates: forge.pki.Certificate[] = []

  try {
    certificates.push(forge.pki.certificateFromPem(certificatePem))
  } catch {
    throw new Error("INVALID_MAIN_CERTIFICATE")
  }

  for (const pem of chainPem) {
    try {
      certificates.push(forge.pki.certificateFromPem(pem))
    } catch {
      // ignora certificado inválido da cadeia
    }
  }

  p7.certificates = certificates
  p7.rawCapture = p7.rawCapture ?? {}

  if (ocspResponse) {
    p7.rawCapture.ocsp = decodeBase64(ocspResponse)
  }

  if (crl) {
    p7.rawCapture.crl = decodeBase64(crl)
  }

  if (tsaToken) {
    p7.rawCapture.timestamp = decodeBase64(tsaToken)
  }

  if (typeof p7.toAsn1 !== "function") {
    throw new Error("PKCS7_TO_ASN1_NOT_AVAILABLE")
  }

  const newDer = forge.asn1.toDer(p7.toAsn1()).getBytes()

  return forge.util.encode64(newDer)
}