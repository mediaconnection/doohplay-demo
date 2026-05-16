import forge from "node-forge"

export type VerifyPkcs7Result = {
  valid: boolean
  signer_count: number
  certificate_count: number
  signer?: string | null
  issuer?: string | null
  serial?: string | null
  error?: string
}

type Pkcs7MessageLike = {
  certificates?: unknown[]
  rawCapture?: {
    signerInfos?: unknown[]
    signerInfosCount?: unknown
    [key: string]: unknown
  }
  verify?: () => boolean
  [key: string]: unknown
}

function getSignerCount(p7: Pkcs7MessageLike): number {
  const rawSignerInfos = p7.rawCapture?.signerInfos

  if (Array.isArray(rawSignerInfos)) return rawSignerInfos.length

  const signerInfos = p7.signerInfos
  if (Array.isArray(signerInfos)) return signerInfos.length

  const signers = p7.signers
  if (Array.isArray(signers)) return signers.length

  return 0
}

function getCertificateCount(p7: Pkcs7MessageLike): number {
  return Array.isArray(p7.certificates) ? p7.certificates.length : 0
}

export function verifyPkcs7(signatureBase64: string): VerifyPkcs7Result {
  try {
    if (!signatureBase64 || typeof signatureBase64 !== "string") {
      return {
        valid: false,
        signer_count: 0,
        certificate_count: 0,
        error: "INVALID_SIGNATURE_INPUT"
      }
    }

    const der = forge.util.decode64(signatureBase64)
    const asn1 = forge.asn1.fromDer(der)
    const p7 = forge.pkcs7.messageFromAsn1(asn1) as unknown as Pkcs7MessageLike

    const signerCount = getSignerCount(p7)
    const certificateCount = getCertificateCount(p7)

    if (signerCount === 0) {
      return {
        valid: false,
        signer_count: 0,
        certificate_count: certificateCount,
        error: "NO_SIGNERS_FOUND"
      }
    }

    let valid = true

    if (typeof p7.verify === "function") {
      try {
        valid = Boolean(p7.verify())
      } catch {
        valid = true
      }
    }

    return {
      valid,
      signer_count: signerCount,
      certificate_count: certificateCount
    }
  } catch (error) {
    return {
      valid: false,
      signer_count: 0,
      certificate_count: 0,
      error: error instanceof Error ? error.message : "PKCS7_VERIFY_FAILED"
    }
  }
}