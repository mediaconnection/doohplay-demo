import fs from "fs"
import path from "path"
import PDFDocument from "pdfkit"
import QRCode from "qrcode"
import { generateHash } from "./generateHash"

interface ReportData {
  campaign: string
  player: string
  location: string
  views: number
  period: string
}

export async function generateReport(data: ReportData) {

  const timestamp = Date.now()

  const proofsDir = path.join(process.cwd(), "proofs")

  if (!fs.existsSync(proofsDir)) {
    fs.mkdirSync(proofsDir, { recursive: true })
  }

  const filePath = path.join(
    proofsDir,
    `report-${timestamp}.pdf`
  )

  const doc = new PDFDocument({
    margin: 50
  })

  const stream = fs.createWriteStream(filePath)

  doc.pipe(stream)

  const timestampIso = new Date().toISOString()

  const hash = generateHash(
    JSON.stringify({
      ...data,
      timestamp: timestampIso
    })
  )

  const verifyUrl = `http://localhost:3000/verify/${hash}`

  const qrImage = await QRCode.toDataURL(verifyUrl)

  doc.fontSize(20)
     .text("RELATÓRIO DE EXECUÇÃO DOOHPLAY", {
       align: "center"
     })

  doc.moveDown()

  doc.fontSize(12)

  doc.text(`Campanha: ${data.campaign}`)
  doc.text(`Player: ${data.player}`)
  doc.text(`Localização: ${data.location}`)
  doc.text(`Exibições: ${data.views}`)
  doc.text(`Período: ${data.period}`)

  doc.moveDown()

  doc.text("Hash SHA256:")
  doc.fontSize(10).text(hash)

  doc.moveDown()

  doc.fontSize(12)
  doc.text(`Timestamp: ${timestampIso}`)

  doc.moveDown()

  doc.fontSize(12)
  doc.text("CERTIFICAÇÃO DIGITAL", {
    underline: true
  })

  doc.moveDown()

  doc.fontSize(10)
  doc.text("Documento gerado pela plataforma DOOHPLAY.")
  doc.text("Integridade garantida por hash criptográfico SHA-256.")
  doc.text("Este documento pode ser verificado publicamente.")

  doc.moveDown()

  doc.image(qrImage, {
    fit: [120, 120],
    align: "center"
  })

  doc.moveDown()

  doc.fontSize(9)
  doc.text(
    "Escaneie o QR Code para verificar a autenticidade do documento.",
    { align: "center" }
  )

  doc.end()

  await new Promise<void>((resolve, reject) => {
    stream.on("finish", () => resolve())
    stream.on("error", reject)
  })

  return {
    filePath,
    hash,
    verifyUrl
  }
}