require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { PDFDocument, PDFName, PDFHexString, PDFArray, PDFNumber } = require("pdf-lib");
const { execFileSync } = require("child_process");

// ===== CONFIG =====
const ROOT = path.join(__dirname, "..");
const INPUT_PDF  = path.join(ROOT, "reports", "relatorio.pdf");
const OUTPUT_PDF = path.join(ROOT, "reports", "relatorio-assinado.pdf");
const SIGNATURE  = path.join(ROOT, "assinatura.p7s");

// ===== VALIDAÇÕES =====
if (!fs.existsSync(INPUT_PDF)) {
  console.error("PDF não encontrado:", INPUT_PDF);
  process.exit(1);
}

// ===== ETAPA 1 — Gerar assinatura PKCS#7 (A1) =====
console.log("🔐 Assinando com A1...");
execFileSync("node", ["scripts/assinarComA1.js", INPUT_PDF], {
  cwd: ROOT,
  stdio: "inherit"
});

if (!fs.existsSync(SIGNATURE)) {
  console.error("Falha ao gerar assinatura PKCS#7");
  process.exit(1);
}

// ===== ETAPA 2 — Embutir assinatura no PDF (Node puro) =====
console.log("📄 Embutindo assinatura no PDF (Node.js puro)...");

(async () => {
  const pdfBytes = fs.readFileSync(INPUT_PDF);
  const signatureBytes = fs.readFileSync(SIGNATURE);

  const pdfDoc = await PDFDocument.load(pdfBytes);

  const context = pdfDoc.context;

  // Placeholder de assinatura (tamanho fixo)
  const signatureHex = PDFHexString.of("0".repeat(8192));

  const byteRange = context.obj([
    PDFNumber.of(0),
    PDFNumber.of(0),
    PDFNumber.of(0),
    PDFNumber.of(0),
  ]);

  const signatureDict = context.obj({
    Type: PDFName.of("Sig"),
    Filter: PDFName.of("Adobe.PPKLite"),
    SubFilter: PDFName.of("adbe.pkcs7.detached"),
    ByteRange: byteRange,
    Contents: signatureHex,
    Reason: PDFHexString.fromText("Assinatura Digital A1"),
    M: PDFHexString.fromText(new Date().toISOString()),
  });

  const sigRef = context.register(signatureDict);

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  firstPage.node.set(
    PDFName.of("Annots"),
    context.obj([
      context.obj({
        Type: PDFName.of("Annot"),
        Subtype: PDFName.of("Widget"),
        FT: PDFName.of("Sig"),
        Rect: context.obj([0, 0, 0, 0]),
        V: sigRef,
        T: PDFHexString.fromText("Signature1"),
        F: PDFNumber.of(4),
        P: firstPage.ref,
      }),
    ])
  );

  pdfDoc.catalog.set(
    PDFName.of("AcroForm"),
    context.obj({
      SigFlags: PDFNumber.of(3),
      Fields: context.obj([sigRef]),
    })
  );

  const modifiedPdf = await pdfDoc.save({ useObjectStreams: false });

  // ===== Corrigir ByteRange e inserir assinatura =====
  const placeholder = Buffer.from("0".repeat(8192), "hex");
  const placeholderIndex = modifiedPdf.indexOf(placeholder);

  const byteRangeStart = placeholderIndex;
  const byteRangeEnd = byteRangeStart + placeholder.length;

  const actualByteRange = [
    0,
    byteRangeStart,
    byteRangeEnd,
    modifiedPdf.length - byteRangeEnd,
  ];

  let pdfWithRange = Buffer.from(modifiedPdf);

  const byteRangeString = `/ByteRange [${actualByteRange.join(" ")}]`;
  pdfWithRange = Buffer.from(
    pdfWithRange
      .toString()
      .replace(/\/ByteRange\s*\[[^\]]+\]/, byteRangeString)
  );

  const signatureHexReal = signatureBytes.toString("hex");
  const paddedSignature =
    signatureHexReal + "0".repeat(8192 * 2 - signatureHexReal.length);

  pdfWithRange = Buffer.from(
    pdfWithRange
      .toString()
      .replace("0".repeat(8192 * 2), paddedSignature)
  );

  fs.writeFileSync(OUTPUT_PDF, pdfWithRange);
  fs.unlinkSync(SIGNATURE);

  console.log("✅ PDF ASSINADO COM SUCESSO:");
  console.log("👉", OUTPUT_PDF);
})();
