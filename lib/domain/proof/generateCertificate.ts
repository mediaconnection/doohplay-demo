import { generateCertificate as _generateCertificate } from "../../pdf/generateCertificate"
import fs from "fs"
import path from "path"
import os from "os"

export type { GenerateCertificateInput } from "../../pdf/generateCertificate"

export async function generateCertificate(
  input: Parameters<typeof _generateCertificate>[0]
): Promise<string> {
  const buf = await _generateCertificate(input)
  const filePath = path.join(os.tmpdir(), `cert-${Date.now()}.pdf`)
  fs.writeFileSync(filePath, buf)
  return filePath
}

export default generateCertificate
