// src/services/reports/generateReportPdf.ts

import QRCode from "qrcode";
import { renderToBuffer } from "@react-pdf/renderer";

import { renderReportPdf } from "@/lib/pdf/renderReportPdf";
import { supabaseServer } from "@/lib/supabaseServer";
import { createEvidence } from "@/services/evidences/createEvidence";

interface GenerateReportPdfParams {
  report: any;
  hash: string;
  reportEvidenceId: string;
}

export async function generateReportPdf(
  params: GenerateReportPdfParams
) {
  const pdfPath = `reports/${params.hash}.pdf`;

  // 1️⃣ Gera QR e PDF SEM depender de list()
  const verifyUrl = `https://doohplay.com/verify/${params.hash}`;

  const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 300,
  });

  const pdfElement = renderReportPdf({
    report: params.report,
    hash: params.hash,
    verifyUrl,
    qrCodeDataUrl,
  });

  const pdfBuffer = await renderToBuffer(pdfElement);

  // 2️⃣ Tenta salvar PDF (idempotente por tratamento de erro)
  const { error: uploadError } = await supabaseServer.storage
    .from("reports")
    .upload(pdfPath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (
    uploadError &&
    !uploadError.message.includes("already exists")
  ) {
    throw new Error(`Erro ao salvar PDF: ${uploadError.message}`);
  }

  // 3️⃣ URL pública do PDF (sempre)
  const { data: publicUrl } = supabaseServer.storage
    .from("reports")
    .getPublicUrl(pdfPath);

  if (!publicUrl?.publicUrl) {
    throw new Error("Falha ao obter URL pública do PDF");
  }

  // 4️⃣ Evidence do PDF (hash PURO, idempotente)
  const pdfEvidence = await createEvidence({
    hash: params.hash,
    type: "evidence",
    relatedEntityType: "report_pdf",
    relatedEntityId: params.reportEvidenceId,
    pdfUrl: publicUrl.publicUrl,
  });

  return {
    pdfUrl: publicUrl.publicUrl,
    pdfEvidence,
  };
}