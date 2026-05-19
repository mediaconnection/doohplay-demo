import fs from "fs"
import signer from "node-signpdf"

export function signPdfPades(pdfBuffer: Buffer): Buffer {

  const pfxPath = process.env.CERT_PFX_PATH
  const password = process.env.CERT_PFX_PASSWORD

  if (!pfxPath || !password) {
    throw new Error("PFX não configurado")
  }

  const p12Buffer = fs.readFileSync(pfxPath)

  try {
    const signedPdf = signer.sign(pdfBuffer, {
      p12Buffer,
      passphrase: password,
    })

    return signedPdf

  } catch (err) {
    console.error("PAdES SIGN ERROR:", err)
    throw new Error("Erro ao assinar PDF")
  }
}