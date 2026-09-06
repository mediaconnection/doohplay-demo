import { generateReportPdf } from "./generateReportPdf";

export async function generateCertifiedReportPdf(): Promise<Buffer> {
  return await generateReportPdf();
}
