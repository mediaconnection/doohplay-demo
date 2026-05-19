require("dotenv").config();

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");
const QRCode = require("qrcode");

// ===== CONFIG =====
const ROOT = path.join(__dirname, "..");

const INPUT_DIR  = path.join(ROOT, "batch", "input");
const OUTPUT_DIR = path.join(ROOT, "batch", "output");

const LOG_DIR  = path.join(ROOT, "logs");
const LOG_FILE = path.join(LOG_DIR, "assinaturas.log");

const SIGN_SCRIPT = path.join(ROOT, "scripts", "assinarPdfNode.js");

// ===== PREPARAÇÃO =====
if (!fs.existsSync(INPUT_DIR)) fs.mkdirSync(INPUT_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

// ===== LISTAR PDFs =====
const arquivos = fs
  .readdirSync(INPUT_DIR)
  .filter(f => f.toLowerCase().endsWith(".pdf"));

if (arquivos.length === 0) {
  console.log("📂 Nenhum PDF encontrado em batch/input");
  process.exit(0);
}

console.log(`📦 Iniciando assinatura em lote (${arquivos.length} arquivos)\n`);

// ===== PROCESSAMENTO =====
for (const arquivo of arquivos) {

  const inputPdf  = path.join(INPUT_DIR, arquivo);

  const outputPdf = path.join(
    OUTPUT_DIR,
    arquivo.replace(/\.pdf$/i, "-assinado.pdf")
  );

  try {

    console.log(`🔏 Assinando: ${arquivo}`);

    execFileSync(
      "node",
      [SIGN_SCRIPT, inputPdf, outputPdf],
      {
        cwd: ROOT,
        stdio: "inherit"
      }
    );

    // ===== HASH PARA AUDITORIA =====
    const hash = crypto
      .createHash("sha256")
      .update(fs.readFileSync(outputPdf))
      .digest("hex");

    const logLine =
      `${new Date().toISOString()} | ${arquivo} | SHA256=${hash}\n`;

    fs.appendFileSync(LOG_FILE, logLine);

    console.log(`✅ Concluído: ${arquivo}\n`);

  } catch (err) {

    console.error(`❌ Erro ao assinar ${arquivo}: ${err.message}`);

    const logLine =
      `${new Date().toISOString()} | ${arquivo} | ERRO=${err.message}\n`;

    fs.appendFileSync(LOG_FILE, logLine);
  }
}

console.log("🏁 Assinatura em lote finalizada.");
console.log(`📄 Arquivos assinados em: ${OUTPUT_DIR}`);
console.log(`🧾 Log técnico: ${LOG_FILE}`);