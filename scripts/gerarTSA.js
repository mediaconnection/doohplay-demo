require("dotenv").config();

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");

const INPUT_DIR = path.join(ROOT, "batch", "output");

const TSA_DIR = path.join(ROOT, "tsa");
const REQ_DIR = path.join(TSA_DIR, "requests");
const RES_DIR = path.join(TSA_DIR, "responses");

const LOG_FILE = path.join(ROOT, "logs", "tsa.log");

// criar pastas
[REQ_DIR, RES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const arquivos = fs.readdirSync(INPUT_DIR)
  .filter(f => f.toLowerCase().endsWith(".pdf"));

if (arquivos.length === 0) {
  console.log("⚠️ Nenhum PDF encontrado para TSA");
  process.exit(0);
}

console.log(`⏱️ Gerando TSA para ${arquivos.length} arquivos`);

for (const arquivo of arquivos) {

  const pdfPath = path.join(INPUT_DIR, arquivo);

  const hash = crypto
    .createHash("sha256")
    .update(fs.readFileSync(pdfPath))
    .digest("hex");

  const reqFile = path.join(REQ_DIR, arquivo + ".tsq");
  const resFile = path.join(RES_DIR, arquivo + ".tst");

  try {

    // criar requisição
    execSync(`openssl ts -query -digest ${hash} -sha256 -cert -out "${reqFile}"`);

    // enviar para TSA pública
    execSync(`
      curl -s
      -H "Content-Type: application/timestamp-query"
      --data-binary "@${reqFile}"
      https://freetsa.org/tsr
      > "${resFile}"
    `);

    const log =
      `${new Date().toISOString()} | ${arquivo} | TSA_OK\n`;

    fs.appendFileSync(LOG_FILE, log);

    console.log(`✅ TSA gerado: ${arquivo}`);

  } catch (err) {

    const log =
      `${new Date().toISOString()} | ${arquivo} | TSA_ERRO=${err.message}\n`;

    fs.appendFileSync(LOG_FILE, log);

    console.error(`❌ Erro TSA: ${arquivo}`);
  }
}

console.log("🏁 TSA finalizado");