// @ts-nocheck
import nodeSignPdf, { plainAddPlaceholder } from "node-signpdf"

type SignPdfOptions = {
  reason?: string
  name?: string
  location?: string
  contactInfo?: string
}

type SignPdfLike = {
  sign?: (
    pdfBuffer: Buffer,
    pfxBuffer: Buffer,
    options: { passphrase: string }
  ) => Buffer
}

function hasSignature(pdf: Buffer): boolean {
  return pdf.includes(Buffer.from("/ByteRange"))
}

function resolveSigner(): SignPdfLike["sign"] {
  if (typeof nodeSignPdf === "function") {
    return nodeSignPdf as SignPdfLike["sign"]
  }

  const maybeObject = nodeSignPdf as SignPdfLike

  if (typeof maybeObject.sign === "function") {
    return maybeObject.sign
  }

  return undefined
}

export function signPdfBuffer(
  pdfBuffer: Buffer,
  pfxBuffer: Buffer,
  passphrase: string,
  options: SignPdfOptions = {}
): Buffer {
  if (!Buffer.isBuffer(pdfBuffer)) {
    throw new Error("Invalid PDF buffer")
  }

  if (!Buffer.isBuffer(pfxBuffer)) {
    throw new Error("Invalid PFX buffer")
  }

  if (!passphrase) {
    throw new Error("Missing PFX passphrase")
  }

  if (hasSignature(pdfBuffer)) {
    throw new Error("PDF already signed (multiple signatures not supported yet)")
  }

  const {
    reason = "DOOHPLAY Digital Certificate",
    name = "DOOHPLAY Trust Authority",
    location = "Brazil",
    contactInfo = "security@doohplay.com"
  } = options

  try {
    const pdfWithPlaceholder = plainAddPlaceholder({
      pdfBuffer,
      reason,
      name,
      location,
      contactInfo,
      signatureLength: 16000
    })

    if (!Buffer.isBuffer(pdfWithPlaceholder)) {
      throw new Error("Failed to add signature placeholder")
    }

    const signer = resolveSigner()

    if (!signer) {
      throw new Error("node-signpdf signer not available")
    }

    const signedPdf = signer(pdfWithPlaceholder, pfxBuffer, {
      passphrase
    })

    if (!Buffer.isBuffer(signedPdf)) {
      throw new Error("PDF signing failed")
    }

    if (!hasSignature(signedPdf)) {
      throw new Error("Signature not embedded correctly")
    }

    return signedPdf
  } catch (error) {
    console.error("PDF SIGN ERROR:", error)

    throw new Error(
      `Failed to sign PDF: ${
        error instanceof Error ? error.message : "unknown error"
      }`
    )
  }
}

export default signPdfBuffer
