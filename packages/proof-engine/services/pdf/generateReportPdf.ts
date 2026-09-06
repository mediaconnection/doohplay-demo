// ⚠️ IMPORTANTE: usar a versão STANDALONE
import PDFDocument from "pdfkit/js/pdfkit.standalone";
import path from "path";
import fs from "fs";
import { addCertificationSeal } from "./addCertificationSeal";

export async function generateReportPdf(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        autoFirstPage: false,
      });

      const chunks: Buffer[] = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Registrar fonte custom (opcional, mas ok)
      const fontPath = path.resolve(
        process.cwd(),
        "src/assets/fonts/Roboto-Regular.ttf"
      );

      if (fs.existsSync(fontPath)) {
        doc.registerFont("Roboto", fs.readFileSync(fontPath));
        doc.font("Roboto");
      }

      // Criar página manualmente
      doc.addPage();

      doc.fontSize(16).text("DOOHPLAY – Relatório Certificado", {
        align: "center",
      });

      doc.moveDown();
      doc.fontSize(11).text("Documento gerado automaticamente.");

      // 🖋️ Selo visual
      addCertificationSeal(doc, {
        certificationId: "CERT-2026-0001",
        date: new Date(),
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
