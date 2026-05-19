require("dotenv").config()

const fs = require("fs")
const path = require("path")
const crypto = require("crypto")
const QRCode = require("qrcode")
const { execFileSync } = require("child_process")

const {
  PDFDocument,
  StandardFonts,
  rgb
} = require("pdf-lib")

const INPUT = process.argv[2]
const OUTPUT = process.argv[3]

if (!INPUT || !OUTPUT) {
  console.log("Uso: node scripts/assinarPdfCompleto.js input.pdf output.pdf")
  process.exit(1)
}

const ROOT = path.join(__dirname, "..")
const SIGN_SCRIPT = path.join(ROOT, "scripts", "assinarComA1.js")
const SIGNATURE = path.join(ROOT, "assinatura.p7s")
const LOGO = path.join(ROOT, "assets", "logo.png")

const inputFile = path.resolve(INPUT)
const outputFile = path.resolve(OUTPUT)

if (!fs.existsSync(inputFile)) {
  console.error("PDF não encontrado:", inputFile)
  process.exit(1)
}

const outputDir = path.dirname(outputFile)
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

async function main() {

  try {

    console.log("🔐 Assinando com A1...")

    execFileSync("node", [SIGN_SCRIPT, inputFile], {
      cwd: ROOT,
      stdio: "inherit"
    })

    if (!fs.existsSync(SIGNATURE)) {
      throw new Error("Assinatura PKCS#7 não encontrada")
    }

    const pdfBytes = fs.readFileSync(inputFile)

    const hash = crypto
      .createHash("sha256")
      .update(pdfBytes)
      .digest("hex")

    const verifyUrl = `https://seusistema.com/verify/${hash}`

    console.log("🔗 Hash:", hash)

    const qrBuffer = await QRCode.toBuffer(verifyUrl)

    const pdfDoc = await PDFDocument.load(pdfBytes)

    const page = pdfDoc.getPages()[0]
    const { width } = page.getSize()

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

    const boxX = width - 250
    const boxY = 40

    page.drawRectangle({
      x: boxX,
      y: boxY,
      width: 210,
      height: 100,
      borderWidth: 1,
      borderColor: rgb(0,0,0)
    })

    if (fs.existsSync(LOGO)) {

      const logoBytes = fs.readFileSync(LOGO)
      const logoImage = await pdfDoc.embedPng(logoBytes)
      const logoDims = logoImage.scale(0.25)

      page.drawImage(logoImage, {
        x: boxX + 10,
        y: boxY + 60,
        width: logoDims.width,
        height: logoDims.height
      })
    }

    const qrImage = await pdfDoc.embedPng(qrBuffer)

    page.drawImage(qrImage, {
      x: boxX + 120,
      y: boxY + 10,
      width: 70,
      height: 70
    })

    const texto = [
      "Assinado digitalmente",
      "Documento eletrônico",
      `Hash: ${hash.substring(0,16)}...`,
      `Data: ${new Date().toLocaleString("pt-BR")}`
    ]

    let y = boxY + 45

    for (const linha of texto) {

      page.drawText(linha, {
        x: boxX + 10,
        y,
        size: 9,
        font,
        color: rgb(0,0,0)
      })

      y -= 12
    }

    const finalPdf = await pdfDoc.save()

    fs.writeFileSync(outputFile, finalPdf)

    if (fs.existsSync(SIGNATURE)) {
      fs.unlinkSync(SIGNATURE)
    }

    console.log("✅ PDF FINAL GERADO")
    console.log("👉", outputFile)

  } catch (err) {

    console.error("❌ Erro no processo:", err.message)
    process.exit(1)

  }
}

main()