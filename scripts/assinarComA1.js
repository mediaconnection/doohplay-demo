require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const crypto = require("crypto");

// ===== CONFIG =====
const ROOT = path.join(__dirname, "..");

const pdfPath = process.argv[2];
if (!pdfPath) {
  console.error("Uso: node assinarComA1.js <arquivo.pdf>");
  process.exit(1);
}

const PFX_PATH = process.env.A1_PFX_PATH;
const PFX_PASS = process.env.A1_PFX_PASSWORD;

if (!PFX_PATH || !PFX_PASS) {
  console.error("Variáveis A1_PFX_PATH ou A1_PFX_PASSWORD ausentes");
  process.exit(1);
}

if (!fs.existsSync(pdfPath)) {
  console.error("PDF não encontrado:", pdfPath);
  process.exit(1);
}

// ===== TEMPORÁRIOS ISOLADOS =====
const tmpDir = path.join(ROOT, "tmp");
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

const uid = crypto.randomBytes(6).toString("hex");
const keyPem  = path.join(tmpDir, `key-${uid}.pem`);
const certPem = path.join(tmpDir, `cert-${uid}.pem`);

const signatureOut = path.join(ROOT, "assinatura.p7s");

try {
  console.log("🔑 Extraindo chave privada do A1...");
  execFileSync(
    "openssl",
    [
      "pkcs12",
      "-in", PFX_PATH,
      "-nocerts",
      "-nodes",
      "-passin", `pass:${PFX_PASS}`,
      "-out", keyPem,
    ],
    { stdio: "inherit" }
  );

  console.log("📜 Extraindo certificado público...");
  execFileSync(
    "openssl",
    [
      "pkcs12",
      "-in", PFX_PATH,
      "-clcerts",
      "-nokeys",
      "-passin", `pass:${PFX_PASS}`,
      "-out", certPem,
    ],
    { stdio: "inherit" }
  );

  console.log("✍️ Gerando assinatura PKCS#7 (SHA-256)...");
  execFileSync(
    "openssl",
    [
      "smime",
      "-sign",
      "-binary",
      "-md", "sha256",
      "-in", pdfPath,
      "-signer", certPem,
      "-inkey", keyPem,
      "-outform", "DER",
      "-out", signatureOut,
    ],
    { stdio: "inherit" }
  );

  const sigSize = fs.statSync(signatureOut).size;
  if (sigSize > 14000) {
    console.warn(
      `⚠️ Atenção: assinatura PKCS#7 grande (${sigSize} bytes). Verifique se o placeholder do PDF é suficiente.`
    );
  }

  console.log("✅ Assinatura PKCS#7 gerada com sucesso:", signatureOut);

} catch (err) {
  console.error("❌ Erro ao assinar com A1:", err.message);
  process.exit(1);
} finally {
  // ===== LIMPEZA SEGURA =====
  try {
    if (fs.existsSync(keyPem)) fs.unlinkSync(keyPem);
    if (fs.existsSync(certPem)) fs.unlinkSync(certPem);
  } catch (_) {}
}
