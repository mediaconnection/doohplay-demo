import forge from "node-forge"

type ForgeCertificateLike = {
  subject?: {
    attributes?: unknown[]
  }
  issuer?: {
    attributes?: unknown[]
  }
  serialNumber?: string
  validity?: {
    notBefore?: Date
    notAfter?: Date
  }
}

type ForgePkcs7SignedLike = {
  signers?: unknown[]
  certificates?: ForgeCertificateLike[]
  verify?: (options?: {
    signer?: number
    content?: forge.util.ByteBuffer
  }) => boolean
}

export type VerifyICPResult =
  | {
      valid: true
      certificate: {
        subject: unknown[]
        issuer: unknown[]
        serialNumber: string | null
        validFrom: Date | null
        validTo: Date | null
      }
    }
  | {
      valid: false
      reason: string
      certificate?: {
        subject: unknown[]
        issuer: unknown[]
        serialNumber: string | null
        validFrom: Date | null
        validTo: Date | null
      }
    }

function normalizeCertificate(cert: ForgeCertificateLike | undefined) {
  return {
    subject: cert?.subject?.attributes ?? [],
    issuer: cert?.issuer?.attributes ?? [],
    serialNumber: cert?.serialNumber ?? null,
    validFrom: cert?.validity?.notBefore ?? null,
    validTo: cert?.validity?.notAfter ?? null
  }
}

export function verifyICP(
  signatureBase64: string,
  data: string
): VerifyICPResult {
  try {
    const p7Der = forge.util.decode64(signatureBase64)
    const p7Asn1 = forge.asn1.fromDer(p7Der)
    const p7 = forge.pkcs7.messageFromAsn1(p7Asn1) as ForgePkcs7SignedLike

    const signers = Array.isArray(p7.signers) ? p7.signers : []
    const certificates = Array.isArray(p7.certificates) ? p7.certificates : []

    if (signers.length === 0) {
      return { valid: false, reason: "NO_SIGNER" }
    }

    const cert = certificates[0]
    const certificate = normalizeCertificate(cert)

    if (typeof p7.verify !== "function") {
      return {
        valid: false,
        reason: "VERIFY_METHOD_NOT_AVAILABLE",
        certificate
      }
    }

    const verified = p7.verify({
      signer: 0,
      content: forge.util.createBuffer(data, "utf8")
    })

    if (!verified) {
      return {
        valid: false,
        reason: "SIGNATURE_VERIFY_FAILED",
        certificate
      }
    }

    return {
      valid: true,
      certificate
    }
  } catch {
    return { valid: false, reason: "INVALID_SIGNATURE" }
  }
}