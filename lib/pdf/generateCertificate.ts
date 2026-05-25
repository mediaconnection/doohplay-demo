// @ts-nocheck
import fs from "fs"

import { signPdfBuffer } from "./signPdf"

type GenerateCertificateInput = {
  pdfBuffer: Buffer | Uint8Array
}

function toBuffer(value: Buffer | Uint8Array): Buffer {
  return Buffer.isBuffer(value) ? value : Buffer.from(value)
}

export async function generateCertificate({
  pdfBuffer
}: GenerateCertificateInput): Promise<Buffer> {
  const pfxPath = process.env.CERT_PFX_PATH
  const password = process.env.CERT_PFX_PASSWORD

  if (!pfxPath) {
    throw new Error("CERT_PFX_PATH is not configured")
  }

  if (!password) {
    throw new Error("CERT_PFX_PASSWORD is not configured")
  }

  if (!fs.existsSync(pfxPath)) {
    throw new Error(`PFX file not found: ${pfxPath}`)
  }

  const pfxBuffer = fs.readFileSync(pfxPath)

  const signedPdf = await signPdfBuffer(
    toBuffer(pdfBuffer),
    pfxBuffer,
    password
  )

  return Buffer.isBuffer(signedPdf)
    ? signedPdf
    : Buffer.from(signedPdf)
}

export default generateCertificate
