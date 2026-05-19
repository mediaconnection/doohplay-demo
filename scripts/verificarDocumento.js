require("dotenv").config();

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");

const LOG_FILE = path.join(ROOT, "logs", "assinaturas.log");
const CHAIN_FILE = path.join(ROOT, "logs", "proofchain.json");
const TSA_DIR = path.join(ROOT, "tsa", "responses");

const arquivo = process.argv[2];

if (!arquivo) {
  console.error("Uso: node verificarDocumento.js arquivo.pdf");
  process.exit(1);
}

if (!fs.existsSync(arquivo)) {
  console.error("❌ Arquivo não encontrado");
  process.exit(1);
}

console.log("\n🔎 INICIANDO VERIFICAÇÃO\n");

// =====================
// HASH DO DOCUMENTO
// =====================

const buffer = fs.readFileSync(arquivo);

const hash = crypto
  .createHash("sha256")
  .update(buffer)
  .digest("hex");

console.log("Hash SHA256:", hash);

// =====================
// LOG DE ASSINATURA
// =====================

if (!fs.existsSync(LOG_FILE)) {
  console.log("⚠️ Log de assinaturas não encontrado");
} else {

  const log = fs.readFileSync(LOG_FILE, "utf8");

  const encontrado = log.includes(hash);

  console.log(
    "Registro no log:",
    encontrado ? "✅ encontrado" : "❌ não encontrado"
  );
}

// =====================
// PROOFCHAIN
// =====================

if (!fs.existsSync(CHAIN_FILE)) {

  console.log("⚠️ ProofChain não encontrada");

} else {

  const chain = JSON.parse(fs.readFileSync(CHAIN_FILE));

  const bloco = chain.blocos.find(
    b => b.hash_documento === hash
  );

  if (bloco) {

    console.log("ProofChain:", "✅ bloco encontrado");

    console.log("Index:", bloco.index);
    console.log("Timestamp:", bloco.timestamp);

  } else {

    console.log("ProofChain:", "❌ não encontrado");
  }
}

// =====================
// TSA
// =====================

const nome = path.basename(arquivo);

const tsaFile = path.join(TSA_DIR, nome + ".tst");

if (fs.existsSync(tsaFile)) {

  console.log("Timestamp TSA:", "✅ presente");

} else {

  console.log("Timestamp TSA:", "⚠️ não encontrado");
}

console.log("\n✔ Verificação finalizada\n");