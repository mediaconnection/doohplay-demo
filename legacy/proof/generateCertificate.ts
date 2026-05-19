import fs from "fs"
import path from "path"
import PDFDocument from "pdfkit"
import QRCode from "qrcode"

export type CertificateInput = {
  hash: string
  issuedAt?: string
  expiresAt?: string | null
  verifyUrl: string
  advertiser?: string | null
  campaign?: string | null
}

function formatDate(date?: string | null): string {
  if (!date) return "N/A"

  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return "N/A"

  return parsed.toLocaleString("pt-BR")
}

function safeFilePart(value: string): string {
  return value.replace(/^0x/, "").replace(/[^a-fA-F0-9]/g, "").slice(0, 80)
}

async function generateQRCode(filePath: string, data: string) {
  await QRCode.toFile(filePath, data, {
    width: 220,
    margin: 1
  })
}

function ensureTmpDir(): string {
  const tmpDir = path.join(process.cwd(), "tmp")

  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true })
  }

  return tmpDir
}

export async function generateCertificatePDF(
  input: CertificateInput
): Promise<string> {
  if (!input.hash?.trim()) {
    throw new Error("HASH_REQUIRED")
  }

  if (!input.verifyUrl?.trim()) {
    throw new Error("VERIFY_URL_REQUIRED")
  }

  const tmpDir = ensureTmpDir()
  const safeHash = safeFilePart(input.hash)

  const outputPath = path.join(tmpDir, `certificate-${safeHash}.pdf`)
  const qrPath = path.join(tmpDir, `qr-${safeHash}.png`)

  await generateQRCode(qrPath, input.verifyUrl)

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      info: {
        Title: "DOOHPLAY - Certificado de Verificação",
        Author: "DOOHPLAY",
        Subject: input.hash
      }
    })

    const stream = fs.createWriteStream(outputPath)

    stream.on("finish", resolve)
    stream.on("error", reject)
    doc.on("error", reject)

    doc.pipe(stream)

    doc.fontSize(24).text("DOOHPLAY", { align: "center" })
    doc.moveDown(0.8)

    doc
      .fontSize(16)
      .text("Certificado de Verificação de Evento Publicitário", {
        align: "center"
      })

    doc.moveDown(2)

    doc.fontSize(11)
    doc.text("Hash do Evento:", { continued: true }).font("Helvetica-Bold")
    doc.text(` ${input.hash}`)
    doc.font("Helvetica")

    doc.moveDown(0.8)
    doc.text(`Data de Emissão: ${formatDate(input.issuedAt)}`)

    doc.moveDown(0.8)
    doc.text(`Validade: ${formatDate(input.expiresAt)}`)

    if (input.advertiser) {
      doc.moveDown(0.8)
      doc.text(`Anunciante: ${input.advertiser}`)
    }

    if (input.campaign) {
      doc.moveDown(0.8)
      doc.text(`Campanha: ${input.campaign}`)
    }

    doc.moveDown(2)

    doc.text("Escaneie o QR Code para validar este evento:", {
      align: "center"
    })

    doc.moveDown(1)

    const qrSize = 150
    const x = (doc.page.width - qrSize) / 2
    doc.image(qrPath, x, doc.y, {
      width: qrSize,
      height: qrSize
    })

    doc.moveDown(9)

    doc.fontSize(9).text(`URL de Verificação: ${input.verifyUrl}`, {
      align: "center"
    })

    doc.moveDown(3)

    doc
      .fontSize(9)
      .fillColor("#555")
      .text(
        "Este certificado foi gerado automaticamente pelo sistema DOOHPLAY e pode ser verificado publicamente.",
        {
          align: "center"
        }
      )

    doc.end()
  })

  fs.rmSync(qrPath, { force: true })

  return outputPath
}

/* Compat com imports antigos */
export const generateCertificate = generateCertificatePDF