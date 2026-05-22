import { timestampPdfWithTSA } from "@/services/signatures/timestampPdfWithTSA";

/**
 * Aplica LTV (Long Term Validation) ao MANIFESTO assinado
 */
export async function applyLtvToManifest(params: {
  manifestSignedPdfUrl: string;
  baseHash: string;
  relatedEvidenceId: string;
}) {
  // Reutilizamos TSA como carimbo final LTV
  const { tsaUrl, tsaEvidence } =
    await timestampPdfWithTSA({
      signedPdfUrl: params.manifestSignedPdfUrl,
      baseHash: `${params.baseHash}:manifest:ltv`,
      relatedEvidenceId: params.relatedEvidenceId,
    });

  return {
    manifestLtvUrl: tsaUrl,
    manifestLtvEvidence: tsaEvidence,
  };
}