const QRCode = require("qrcode")
const crypto = require("crypto")
const fs = require("fs")

const pdfBytes = fs.readFileSync("reports/relatorio-final.pdf")

const hash = crypto
  .createHash("sha256")
  .update(pdfBytes)
  .digest("hex")

const verifyUrl = `https://seusistema.com/verify/${hash}`

QRCode.toFile("qrcode.png", verifyUrl)

console.log("QR Code gerado:", verifyUrl)