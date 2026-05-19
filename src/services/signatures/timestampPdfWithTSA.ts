import { buildTsaRequest } from "@/lib/tsa/buildTsaRequest";
import { sendTsaRequest } from "@/lib/tsa/sendTsaRequest";
import { supabaseServer } from "@/lib/supabaseServer";
import { createEvidence } from "@/services/evidences/createEvidence";

export async function timestampPdfWithTSA(params: {
  signedPdfUrl: string;
  baseHash: string;
  relatedEvidenceId: string;
}) {
  const tsaPath = `tsa/${params.baseHash}.rfc3161`;

  // 1️⃣ Verifica se o TSA já existe no storage (IDEMPOTÊNCIA)
  const { data: existingFiles, error: listError } =
    await supabaseServer.storage
      .from("reports")
      .list("tsa", {
        search: `${params.baseHash}.rfc3161`,
        limit: 1,
      });

  if (listError) {
    throw new Error(`Erro ao consultar TSA existente: ${listError.message}`);
  }

  // 2️⃣ Se NÃO existir TSA, cria
  if (!existingFiles || existingFiles.length === 0) {
    // 2.1️⃣ Baixa PDF assinado
    const pdfRes = await fetch(params.signedPdfUrl);
    if (!pdfRes.ok) {
      throw new Error("Falha ao baixar PDF assinado");
    }

    const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());

    // 2.2️⃣ Cria TSA request (RFC 3161)
    const tsaRequest = buildTsaRequest(pdfBuffer);

    // 2.3️⃣ Envia para TSA
    const tsaResponse = await sendTsaRequest(tsaRequest);

    // 2.4️⃣ Armazena TSA como prova (UMA ÚNICA VEZ)
    const { error: uploadError } = await supabaseServer.storage
      .from("reports")
      .upload(tsaPath, tsaResponse, {
        contentType: "application/timestamp-reply",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Erro ao salvar TSA: ${uploadError.message}`);
    }
  }

  // 3️⃣ URL pública do TSA
  const { data: publicUrl } = supabaseServer.storage
    .from("reports")
    .getPublicUrl(tsaPath);

  // 4️⃣ Evidence TSA (hash PURO, sem sufixo)
  const tsaEvidence = await createEvidence({
    hash: params.baseHash,      // ✅ SEMPRE 64 chars
    type: "tsa",                // ✅ diferenciação semântica
    relatedEntityType: "pdf",
    relatedEntityId: params.relatedEvidenceId,
    evidenceJsonUrl: publicUrl.publicUrl,
  });

  return {
    tsaUrl: publicUrl.publicUrl,
    tsaEvidence,
  };
}