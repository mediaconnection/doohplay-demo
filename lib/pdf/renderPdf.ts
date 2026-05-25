// @ts-nocheck
import { renderToBuffer } from "@react-pdf/renderer"
import { generatePdfDocument } from "./generatePdfDocument"

export async function renderPdf(props: any): Promise<Buffer> {
  const doc = generatePdfDocument(props)
  return await renderToBuffer(doc)
}
