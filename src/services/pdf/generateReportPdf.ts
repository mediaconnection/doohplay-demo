// ⚠️ IMPORTANTE:
// Usar o build STANDALONE do pdfkit
// Isso elimina totalmente a dependência de Helvetica.afm
import PDFDocument from "pdfkit/js/pdfkit.standalone.js";

import path from "path";
import fs from "fs";
import { Buffer } from "buffer";

/**
 * Gera PDF usando pdfkit (standalone)
 * ✔ Funciona no Next.js + Turbopack
 * ✔ Funciona no Windows
 * ✔ Não acessa Helvetica.afm
 */
export async function generateReportPdf(): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });

      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err: Error) => reject(err));

      // (Opcional) fonte customizada
      const fontPath = path.resolve(
        __dirname,
        "../../assets/fonts/Roboto-Regular.ttf"
      );

      if (fs.existsSync(fontPath)) {
        doc.registerFont("Roboto", fontPath);
        doc.font("Roboto");
      }

      doc.fontSize(16).text("TEST PDF - pdfkit standalone OK", {
        align: "center",
      });

      doc.moveDown();

      doc.fontSize(10).text(
        "PDF gerado com pdfkit standalone.\n" +
          "Nenhuma dependência de Helvetica.afm.\n" +
          "Compatível com Next.js + Turbopack + Windows."
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
