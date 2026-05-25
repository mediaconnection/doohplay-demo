// @ts-nocheck
export type PdfSignatureVerificationResult = {
  valid: boolean
  signed: boolean
  signatures: unknown[]
  reason?: string
  stub: boolean
}

export async function verifyPdfSignature(
  pdfBuffer: Buffer
): Promise<PdfSignatureVerificationResult> {
  if (!Buffer.isBuffer(pdfBuffer) || pdfBuffer.length === 0) {
    return {
      valid: false,
      signed: false,
      signatures: [],
      reason: "PDF_BUFFER_INVALID",
      stub: true
    }
  }

  return {
    valid: true,
    signed: false,
    signatures: [],
    reason: "PDF_SIGNATURE_VERIFICATION_STUB",
    stub: true
  }
}

export async function verifyPdf(
  pdfBuffer: Buffer
): Promise<PdfSignatureVerificationResult> {
  return verifyPdfSignature(pdfBuffer)
}

export default verifyPdfSignature
