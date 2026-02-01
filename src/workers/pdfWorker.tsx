import { pdf } from "@react-pdf/renderer";
import { Buffer } from "buffer";
import { ReportDocument } from "./reportDocument";

/**
 * Worker Node para geração de PDF
 * ⚠️ Usa React PDF — NÃO importar direto em API Routes
 */
export async function generatePdfInWorker(
  data: Record<string, any>
): Promise<Buffer> {
  const buffer = await pdf(
    <ReportDocument data={data} />
  ).toBuffer();

  return Buffer.from(buffer);
}
