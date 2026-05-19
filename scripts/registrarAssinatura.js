require("dotenv").config()

const fs = require("fs")
const path = require("path")
const crypto = require("crypto")

const file = process.argv[2]

if (!file) {
  console.log("Uso: node scripts/registrarAssinatura.js arquivo.pdf")
  process.exit(1)
}

const ROOT = path.join(__dirname, "..")
const LOG_DIR = path.join(ROOT, "logs")
const LOG_FILE = path.join(LOG_DIR, "assinaturas.log")

if (!fs.existsSync(file)) {
  console.log("Arquivo não encontrado:", file)
  process.exit(1)
}

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

const buffer = fs.readFileSync(file)

const hash = crypto
  .createHash("sha256")
  .update(buffer)
  .digest("hex")

const line = `${new Date().toISOString()} | ${path.basename(file)} | SHA256=${hash}\n`

fs.appendFileSync(LOG_FILE, line)

console.log("✅ Assinatura registrada")
console.log("📄 Arquivo:", file)
console.log("🔗 Hash:", hash)