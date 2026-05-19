import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import QRCode from "qrcode"

type Input = {
  status: string
  score: number
  label: string
  eventId: string
  hash: string
  verifyUrl: string
}

export async function generateCertificatePdf(data: Input) {
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([600, 800])

  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)

  const { width, height } = page.getSize()

  let y = height - 60

  /* =========================
     TITLE
  ========================= */

  page.drawText("DOOHPLAY PROOF CERTIFICATE", {
    x: 50,
    y,
    size: 18,
    font: bold
  })

  y -= 40

  /* =========================
     STATUS
  ========================= */

  page.drawText(`Status: ${data.status}`, {
    x: 50,
    y,
    size: 12,
    font
  })

  y -= 20

  page.drawText(
    `Confidence Score: ${data.score}/100 (${data.label})`,
    {
      x: 50,
      y,
      size: 12,
      font
    }
  )

  y -= 30

  /* =========================
     DATA
  ========================= */

  page.drawText(`Event ID: ${data.eventId}`, {
    x: 50,
    y,
    size: 11,
    font
  })

  y -= 18

  page.drawText(`Hash: ${data.hash}`, {
    x: 50,
    y,
    size: 10,
    font
  })

  y -= 30

  /* =========================
     VERIFY URL
  ========================= */

  page.drawText("Verify this proof:", {
    x: 50,
    y,
    size: 11,
    font: bold
  })

  y -= 18

  page.drawText(data.verifyUrl, {
    x: 50,
    y,
    size: 9,
    font,
    color: rgb(0, 0, 1)
  })

  /* =========================
     QR CODE 🔥
  ========================= */

  const qrDataUrl = await QRCode.toDataURL(data.verifyUrl)

  const qrImageBytes = await fetch(qrDataUrl).then(res => res.arrayBuffer())
  const qrImage = await pdf.embedPng(qrImageBytes)

  page.drawImage(qrImage, {
    x: width - 150,
    y: 100,
    width: 100,
    height: 100
  })

  /* =========================
     FOOTER
  ========================= */

  page.drawText(
    `Generated at ${new Date().toISOString()}`,
    {
      x: 50,
      y: 50,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5)
    }
  )

  const bytes = await pdf.save()
  return Buffer.from(bytes)
}