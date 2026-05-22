import PDFDocument from "pdfkit";

type SealOptions = {
  certificationId: string;
  date: Date;
};

export function addCertificationSeal(
  doc: typeof PDFDocument extends new (...args: any[]) => infer I ? I : never,
  { certificationId, date }: SealOptions
) {
  const { width, height } = doc.page;

  const text = [
    "🔐 Certificado digitalmente",
    `Data: ${date.toISOString()}`,
    `ID: ${certificationId}`,
  ].join(" | ");

  doc
    .save()
    .fontSize(8)
    .fillColor("gray")
    .opacity(0.85)
    .text(text, 40, height - 40, {
      width: width - 80,
      align: "center",
    })
    .restore();
}
