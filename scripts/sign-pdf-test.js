require("dotenv").config();

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { PDFDocument, StandardFonts } = require("pdf-lib");
const SignPdf = require("@signpdf/signer-p12").default;

// 📂 Caminhos
const OUTPUT_DIR = path.resolve(__dirname, "../tmp");
const UNSIGNED_PDF = path.join(OUTPUT_DIR, "teste-unsigned.pdf");
const SIGNED_PDF = path.join(OUTPUT_DIR, "teste-signed.pdf");

// 🔐 Certificado A1
const PFX_PATH = process.env.A1_PFX_PATH;
const PFX_PASSWORD = process.env.A1_PFX_PASSWORD;

(async () => {
  try {
    if (!PFX_PATH || !PFX_PASSWORD) {
      throw new Error("A1_PFX_PATH ou A1_PFX_PASSWORD não definidos");
    }

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    // 1️⃣ Criar PDF base
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]);

    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);

    const generatedAt = new Date().toISOString();

    page.drawText("DOCUMENTO DE TESTE – DOOHPLAY", {
      x: 50,
      y: 780,
      size: 18,
      font: fontBold,
    });

    page.drawText(
      `Este documento foi assinado digitalmente
com certificado ICP-Brasil (A1).

Teste técnico-jurídico de assinatura.

Gerado em: ${generatedAt}`,
      {
        x: 50,
        y: 720,
        size: 12,
        font: fontRegular,
        lineHeight: 16,
      }
    );

    const unsignedBuffer = Buffer.from(await pdf.save());
    fs.writeFileSync(UNSIGNED_PDF, unsignedBuffer);

    const baseHash = crypto
      .createHash("sha256")
      .update(unsignedBuffer)
      .digest("hex");

    console.log("📄 PDF base criado:", UNSIGNED_PDF);
    console.log("🔎 SHA-256 (base):", baseHash);

    // 2️⃣ Assinar PDF
    const signer = new SignPdf();
    const p12Buffer = fs.readFileSync(path.resolve(PFX_PATH));

    const signedPdf = signer.sign(unsignedBuffer, p12Buffer, {
      passphrase: PFX_PASSWORD,
    });

    fs.writeFileSync(SIGNED_PDF, signedPdf);

    console.log("✅ PDF ASSINADO COM SUCESSO");
    console.log("🔐 Arquivo:", SIGNED_PDF);

  } catch (err) {
    console.error("❌ ERRO AO ASSINAR PDF");
    console.error(err.message || err);
    process.exit(1);
  }
})();
