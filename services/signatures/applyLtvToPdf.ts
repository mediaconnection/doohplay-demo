export async function applyLtvToPdf(_: {
  signedPdfUrl: string;
  baseHash: string;
  relatedEvidenceId: string;
}) {
  /**
   * LTV (PAdES-LT/LTA) ainda não ativado.
   * Este serviço será conectado a um microserviço Java (iText / DSS).
   */
  throw new Error("LTV service not configured");
}