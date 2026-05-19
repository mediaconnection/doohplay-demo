require("dotenv").config();

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

// ===== CONFIG =====
const ROOT = path.join(__dirname, "..");
const INPUT_DIR  = path.join(ROOT, "batch", "input");
const OUTPUT_DIR = path.join(ROOT, "batch", "output");
const LOG_DIR    = path.join(ROOT, "logs");
const LOG_FILE   = path.join(LOG_DIR, "assinaturas.log");

// ===== PREPARAÇÃO =====
if (!fs.existsSync(INPUT_DIR)) fs.mkdirSync(INPUT_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const arquivos = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith(".pdf"));

if (arquivos.length === 0) {
  console.log("📂 Nenhum PDF encontrado em batch/input");
  process.exit(0);
}

console.log(`📦 Iniciando assinatura em lote (${arquivos.length} arquivos)`);

// ===== PROCESSAMENTO =====
for (const arquivo of arquivos) {
  const inputPdf  = path.join(INPUT_DIR, arquivo);
  const outputPdf = path.join(OUTPUT_DIR, arquivo.replace(".pdf", "-assinado.pdf"));

  try {
    console.log(`\n🔏 Assinando: ${arquivo}`);

    // Copia PDF para reports (pipeline existente)
    const reportsPdf = path.join(ROOT, "reports", "relatorio.pdf");
    fs.copyFileSync(inputPdf, reportsPdf);

    // Executa pipeline já validado
    execFileSync("node", ["scripts/assinarPdfNode.js"], {
      cwd: ROOT,
      stdio: "inherit"
    });

    // Move PDF assinado para output
    const signedPdf = path.join(ROOT, "reports", "relatorio-assinado.pdf");
    fs.copyFileSync(signedPdf, outputPdf);

    // Hash para auditoria
    const hash = crypto
      .createHash("sha256")
      .update(fs.readFileSync(outputPdf))
      .digest("hex");

    // Log técnico
    const logLine = `${new Date().toISOString()} | ${arquivo} | SHA256=${hash}\n`;
    fs.appendFileSync(LOG_FILE, logLine);

    console.log(`✅ Concluído: ${arquivo}`);

  } catch (err) {
    console.error(`❌ Erro ao assinar ${arquivo}:`, err.message);
  }
}

console.log("\n🏁 Assinatura em lote finalizada.");
