import { loadA1Certificate } from "@/lib/crypto/loadA1Certificate";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const SignPdfClass = require("node-signpdf").default as new () => { sign(pdf: Buffer, p12: Buffer, opts?: { passphrase?: string }) : Buffer }
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { plainAddPlaceholder } = require("node-signpdf/dist/helpers/plainAddPlaceholder") as { plainAddPlaceholder: (opts: { pdfBuffer: Buffer; reason?: string; signatureLength?: number }) => Buffer }
import { supabaseServer } from "@/lib/supabaseServer";
import { createEvidence } from "@/services/evidences/createEvidence";

export async function signPdfWithA1(params: {
  pdfUrl: string;
  baseHash: string;
  relatedEvidenceId: string;
}) {
  // 1️⃣ Baixar o PDF original
  const response = await fetch(params.pdfUrl);

  if (!response.ok) {
    throw new Error("Falha ao baixar PDF para assinatura");
  }

  const pdfBuffer = Buffer.from(await response.arrayBuffer());

  // 2️⃣ Inserir placeholder de assinatura
  const pdfWithPlaceholder = plainAddPlaceholder({
    pdfBuffer,
    reason: "Documento verificado – DOOHPLAY",
    signatureLength: 8192,
  });

  // 3️⃣ Carregar certificado A1
  const { pfxBuffer, passphrase } = loadA1Certificate();

  // 4️⃣ Assinar PDF (PKCS#7)
  const signer = new SignPdfClass();
  const signedPdf = signer.sign(pdfWithPlaceholder, pfxBuffer, {
    passphrase,
  });

  // 5️⃣ Salvar PDF assinado no Supabase Storage
  const signedPath = `signed/${params.baseHash}.signed.pdf`;

  const { error: uploadError } = await supabaseServer.storage
    .from("reports")
    .upload(signedPath, signedPdf, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Erro ao subir PDF assinado: ${uploadError.message}`);
  }

  const { data: publicUrl } = supabaseServer.storage
    .from("reports")
    .getPublicUrl(signedPath);

  // 6️⃣ Criar evidence da assinatura
  const signedEvidence = await createEvidence({
    hash: `${params.baseHash}:signed`,
    type: "evidence",
    relatedEntityType: "pdf",
    relatedEntityId: params.relatedEvidenceId,
    pdfUrl: publicUrl.publicUrl,
  });

  return {
    signedPdfUrl: publicUrl.publicUrl,
    signedEvidence,
  };
}