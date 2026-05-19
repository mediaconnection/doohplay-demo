const fs = require("fs");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");

async function gerarPdfProva() {
  const data = {
    hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    algorithm: "SHA-256",
    certificateAuthority: "AC Certisign",
    certificateSerial: "7F4A9C3E",
    timestampToken: "TSA_TOKEN_EXEMPLO",
    issuedAt: "2026-02-02T09:24:54Z",
    legalBasis: "MP 2.200-2/2001",
    verifyUrl:
      "https://mdlbajgnntjwhycouzit.supabase.co/functions/v1/legal-proof/e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  };

  // Gera QR Code
  const qrDataUrl = await QRCode.toDataURL(data.verifyUrl);

  const doc = new PDFDocument({ margin: 50 });
  const out = fs.createWriteStream("prova_certificacao_digital.pdf");
  doc.pipe(out);

  // Título
  doc.fontSize(18).text("PROVA DE CERTIFICAÇÃO DIGITAL", { align: "center" });
  doc.moveDown(2);

  // Conteúdo
  doc.fontSize(11);
  doc.text(`Algoritmo: ${data.algorithm}`);
  doc.text(`Hash do conteúdo: ${data.hash}`);
  doc.text(`Autoridade Certificadora: ${data.certificateAuthority}`);
  doc.text(`Série do certificado: ${data.certificateSerial}`);
  doc.text(`Carimbo do tempo: ${data.timestampToken}`);
  doc.text(`Data de emissão (UTC): ${data.issuedAt}`);
  doc.text(`Base legal: ${data.legalBasis}`);

  doc.moveDown(2);
  doc.text("Verificação pública:", { underline: true });
  doc.text(data.verifyUrl);

  // QR Code
  const qrImage = qrDataUrl.replace(/^data:image\/png;base64,/, "");
  const qrBuffer = Buffer.from(qrImage, "base64");
  doc.moveDown(1);
  doc.image(qrBuffer, { width: 140 });

  // Rodapé
  doc.moveDown(2);
  doc.fontSize(9).text(
    "Este documento comprova a existência e integridade do hash acima, podendo ser verificado publicamente via QR Code.",
    { align: "justify" }
  );

  doc.end();

  out.on("finish", () => {
    console.log("PDF gerado com sucesso: prova_certificacao_digital.pdf");
  });
}

gerarPdfProva().catch(console.error);
