const fs = require("fs");
const path = require("path");
const {
  PDFDocument,
  StandardFonts,
  rgb,
} = require("pdf-lib");

(async () => {
  const input = process.argv[2];
  const output = process.argv[3];

  if (!input || !output) {
    console.error("Uso: node prepararPdfVisual.js <input.pdf> <output.pdf>");
    process.exit(1);
  }

  const pdfBytes = fs.readFileSync(input);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  const page = pdfDoc.getPages()[0];
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const logoPath = path.join(__dirname, "..", "assets", "logo.png");
  const logoBytes = fs.readFileSync(logoPath);
  const logo = await pdfDoc.embedPng(logoBytes);
  const logoDims = logo.scale(0.25);

  const boxX = 330;
  const boxY = 40;
  const boxW = 230;
  const boxH = 100;

  page.drawRectangle({
    x: boxX,
    y: boxY,
    width: boxW,
    height: boxH,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });

  page.drawImage(logo, {
    x: boxX + 10,
    y: boxY + boxH - logoDims.height - 10,
    width: logoDims.width,
    height: logoDims.height,
  });

  const text = [
    "Assinado digitalmente",
    "Documento eletrônico",
    new Date().toLocaleString("pt-BR"),
  ];

  let y = boxY + 35;
  for (const line of text) {
    page.drawText(line, {
      x: boxX + 10,
      y,
      size: 9,
      font,
      color: rgb(0, 0, 0),
    });
    y -= 12;
  }

  fs.writeFileSync(output, await pdfDoc.save());
  console.log("✅ PDF visual criado:", output);
})();
