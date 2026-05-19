require("dotenv").config();

const fs = require("fs");
const path = require("path");

const SignPdf = require("@signpdf/signpdf").default;
const SignerP12 = require("@signpdf/signer-p12").default;

// 📂 Arquivos
const INPUT_PDF = path.resolve(__dirname, "../tmp/invoice-unsigned.pdf");
const OUTPUT_PDF = path.resolve(__dirname, "../tmp/invoice-signed.pdf");

// 🔐 Certificado A1
const PFX_PATH = path.resolve(process.env.A1_PFX_PATH);
const PFX_PASSWORD = process.env.A1_PFX_PASSWORD;

(async () => {
  try {
    if (!fs.existsSync(INPUT_PDF)) {
      throw new Error("PDF de entrada não encontrado");
    }

    if (!fs.existsSync(PFX_PATH)) {
      throw new Error("Certificado A1 (.pfx) não encontrado");
    }

    if (!PFX_PASSWORD) {
      throw new Error("Senha do certificado A1 não definida");
    }

    console.log("📄 PDF base:", INPUT_PDF);
    console.log("🔐 Certificado:", PFX_PATH);

    const pdfBuffer = fs.readFileSync(INPUT_PDF);
    const p12Buffer = fs.readFileSync(PFX_PATH);

    // ✅ Signer correto (A1 / ICP-Brasil)
    const signer = new SignerP12(p12Buffer, {
      passphrase: PFX_PASSWORD,
    });

    // ✅ Motor de assinatura
    const signPdf = new SignPdf();

    const signedPdf = signPdf.sign(pdfBuffer, signer);

    fs.writeFileSync(OUTPUT_PDF, signedPdf);

    console.log("✅ PDF ASSINADO COM SUCESSO");
    console.log("📎 Arquivo final:", OUTPUT_PDF);

  } catch (err) {
    console.error("❌ ERRO AO ASSINAR PDF");
    console.error(err.message || err);
    process.exit(1);
  }
})();