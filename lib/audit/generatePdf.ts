import { PDFDocument, StandardFonts } from "pdf-lib"
import QRCode from "qrcode"

export async function generateAuditPdf(data: any) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([600, 800])

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // 🔗 URL pública de verificação
  const verifyUrl = `${process.env.PUBLIC_URL}/api/audit/event/${data.event.hash}`

  // 📱 gerar QR code
  const qrImage = await QRCode.toDataURL(verifyUrl)
  const qrImageBytes = Buffer.from(
    qrImage.split(",")[1],
    "base64"
  )

  const qrImageEmbed = await pdfDoc.embedPng(qrImageBytes)

  // 🧾 conteúdo do documento
  const text = `
DOOHPLAY AUDIT PROOF

Event Hash:
${data.event.hash}

Block Hash:
${data.block.hash}

Merkle Root:
${data.block.merkle_root}

Signature:
${data.proof.signature || "N/A"}

Timestamp:
${data.proof.timestamp || "N/A"}

Verification URL:
${verifyUrl}
`

  page.drawText(text, {
    x: 50,
    y: 650,
    size: 10,
    font
  })

  // 📱 desenhar QR
  page.drawImage(qrImageEmbed, {
    x: 400,
    y: 600,
    width: 150,
    height: 150
  })

  return await pdfDoc.save()
}