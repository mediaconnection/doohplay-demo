require("dotenv").config()

const { execFileSync } = require("child_process")
const path = require("path")
const fs = require("fs")

const INPUT = process.argv[2]

if (!INPUT) {
  console.log("Uso: node scripts/provaDigitalCompleta.js arquivo.pdf")
  process.exit(1)
}

if (!fs.existsSync(INPUT)) {
  console.log("Arquivo não encontrado:", INPUT)
  process.exit(1)
}

const ROOT = path.join(__dirname, "..")

const OUTPUT = path.join(
  ROOT,
  "reports",
  path.basename(INPUT).replace(".pdf", "-prova.pdf")
)

try {

  console.log("\n🔐 1. Assinando PDF")

  execFileSync(
    "node",
    ["scripts/assinarPdfCompleto.js", INPUT, OUTPUT],
    { stdio: "inherit", cwd: ROOT }
  )

  console.log("\n📝 2. Registrando assinatura")

  execFileSync(
    "node",
    ["scripts/registrarAssinatura.js", OUTPUT],
    { stdio: "inherit", cwd: ROOT }
  )

  console.log("\n🔗 3. Atualizando ProofChain")

  execFileSync(
    "node",
    ["scripts/atualizarProofChain.js"],
    { stdio: "inherit", cwd: ROOT }
  )

  console.log("\n⏱️ 4. Gerando TSA")

  execFileSync(
    "node",
    ["scripts/gerarTSA.js"],
    { stdio: "inherit", cwd: ROOT }
  )

  console.log("\n🔎 5. Verificando documento")

  execFileSync(
    "node",
    ["scripts/verificarDocumento.js", OUTPUT],
    { stdio: "inherit", cwd: ROOT }
  )

  console.log("\n🏁 Prova digital completa gerada")

  console.log("📄 PDF final:", OUTPUT)

} catch (err) {

  console.error("Erro no pipeline:", err.message)

}