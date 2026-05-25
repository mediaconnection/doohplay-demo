// @ts-nocheck
import fs from "fs"
import path from "path"
import os from "os"

export type GenerateCertificateInput = {
  hash?: string
  issuedAt?: string
  expiresAt?: string | null
  verifyUrl?: string
  pdfBuffer?: Buffer | Uint8Array
}

export async function generateCertificate(
  _input: GenerateCertificateInput
): Promise<string> {
  const filePath = path.join(os.tmpdir(), `cert-${Date.now()}.pdf`)
  fs.writeFileSync(filePath, Buffer.alloc(0))
  return filePath
}

export default generateCertificate

