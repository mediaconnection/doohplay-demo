import { createEvidence } from "@/services/evidences/createEvidence";
import { supabaseServer } from "@/lib/supabaseServer";

/**
 * Registra a âncora blockchain (OpenTimestamps / equivalente)
 * como a evidence FINAL do pacote pericial.
 */
export async function anchorProofPackage(params: {
  baseHash: string;              // hash raiz do pacote
  baseEvidenceId: string;        // evidence do relatório (origem)
  otsBuffer: Buffer;             // arquivo .ots
  relatedEntityType?: string;
}) {
  // 1️⃣ Armazena âncora no storage
  const anchorPath = `anchors/${params.baseHash}.ots`;

  const { error } = await supabaseServer.storage
    .from("reports")
    .upload(anchorPath, params.otsBuffer, {
      contentType: "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw new Error(`Erro ao salvar âncora blockchain: ${error.message}`);
  }

  const { data: publicUrl } = supabaseServer.storage
    .from("reports")
    .getPublicUrl(anchorPath);

  // 2️⃣ Evidence FINAL (âncora pública)
  const anchorEvidence = await createEvidence({
    hash: `${params.baseHash}:anchor`,
    type: "evidence",
    relatedEntityType: "proof_package",
    relatedEntityId: params.baseEvidenceId,
    evidenceJsonUrl: publicUrl.publicUrl,
  });

  return {
    anchorUrl: publicUrl.publicUrl,
    anchorEvidence,
  };
}