require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const { execFileSync } = require("child_process");

// ===== CONFIG =====
const ROOT = path.join(__dirname, "..");
const INPUT_PDF  = path.join(ROOT, "reports", "relatorio.pdf");
const OUTPUT_PDF = path.join(ROOT, "reports", "relatorio-assinado.pdf");

// ===== ETAPA 1 — Assinar com A1 (gera assinatura.p7s) =====



// ===== ETAPA 2 — Inserir campo visual + assinatura =====
(async () => {
  console.log("🖊️ Inserindo campo visual de assinatura...");

  const pdfBytes = fs.readFileSync(INPUT_PDF);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  const pages = pdfDoc.getPages();
  const page = pages[0];
  const { width } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 9;

  const now = new Date();
  const dateStr = now.toLocaleString("pt-BR");

  const textLines = [
    "Assinado digitalmente",
    "Empresa: DOOHPLAY",
    `Data: ${dateStr}`,
  ];

  let y = 40;

  for (const line of textLines) {
    page.drawText(line, {
      x: 40,
      y,
      size: fontSize,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 12;
  }

  const modifiedPdf = await pdfDoc.save({ useObjectStreams: false });
  fs.writeFileSync(INPUT_PDF, modifiedPdf);

  console.log("📄 Campo visual inserido.");

  // ===== ETAPA 3 — Embutir assinatura (script já validado) =====
  execFileSync("node", ["scripts/assinarPdfNode.js"], {
    cwd: ROOT,
    stdio: "inherit"
  });

})();
