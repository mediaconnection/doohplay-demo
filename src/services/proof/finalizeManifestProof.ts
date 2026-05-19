import { signManifestPdf } from "./signManifestPdf";
import { applyLtvToManifest } from "./applyLtvToManifest";

export async function finalizeManifestProof(params: {
  baseHash: string;
  manifest: any;
  relatedEvidenceId: string;
}) {
  // 1️⃣ Assina manifesto
  const {
    manifestPdfUrl,
    manifestPdfEvidence,
  } = await signManifestPdf({
    baseHash: params.baseHash,
    manifest: params.manifest,
    relatedEvidenceId: params.relatedEvidenceId,
  });

  // 2️⃣ Aplica LTV
  const {
    manifestLtvUrl,
    manifestLtvEvidence,
  } = await applyLtvToManifest({
    manifestSignedPdfUrl: manifestPdfUrl,
    baseHash: params.baseHash,
    relatedEvidenceId: manifestPdfEvidence.id,
  });

  return {
    manifestSignedPdfUrl: manifestPdfUrl,
    manifestLtvUrl,
    evidences: {
      manifestSigned: manifestPdfEvidence,
      manifestLtv: manifestLtvEvidence,
    },
  };
}
