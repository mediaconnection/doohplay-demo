import fs from "fs";
import crypto from "crypto";

import { runReportPipeline } from "@/services/reports/runReportPipeline";
import { generateReportPdf } from "@/services/reports/generateReportPdf";
import { signPdfWithA1 } from "@/services/signatures/signPdfWithA1";
import { timestampPdfWithTSA } from "@/services/signatures/timestampPdfWithTSA";
import { anchorProofPackage } from "@/services/proof/anchorProofPackage";

import { buildManifest } from "@/lib/proof/buildManifest";
import { createEvidence } from "@/services/evidences/createEvidence";
import { finalizeManifestProof } from "@/services/proof/finalizeManifestProof";

interface RunFullProofPipelineParams {
  logs: Array<{
    player_id: string;
    duration_seconds: number;
    started_at: string;
  }>;
  periodStart: string;
  periodEnd: string;
  otsFilePath: string;
  manifestOutputPath?: string;
}

/**
 * Pipeline jurídico COMPLETO do DOOHPLAY
 *
 * ⚖️ Determinístico (baseHash)
 * 🔒 Idempotente
 * 🧾 Auditável
 * ⛓ Cadeia probatória fechada
 */
export async function runFullProofPipeline(
  params: RunFullProofPipelineParams
) {
  /* =====================================================
   * 1️⃣ Relatório + hash + evidence raiz
   * ===================================================== */
  const {
    report,
    hash: baseHash,
    evidence: reportEvidence,
  } = await runReportPipeline({
    logs: params.logs,
    periodStart: params.periodStart,
    periodEnd: params.periodEnd,
  });

  /* =====================================================
   * 2️⃣ PDF institucional
   * ===================================================== */
  const { pdfUrl, pdfEvidence } = await generateReportPdf({
    report,
    hash: baseHash,
    reportEvidenceId: reportEvidence.id,
  });

  /* =====================================================
   * 3️⃣ Assinatura digital A1 (ICP-Brasil)
   * ===================================================== */
  const { signedPdfUrl, signedEvidence } = await signPdfWithA1({
    pdfUrl,
    baseHash,
    relatedEvidenceId: pdfEvidence.id,
  });

  /* =====================================================
   * 4️⃣ Timestamp confiável (TSA RFC 3161)
   * ===================================================== */
  const { tsaUrl, tsaEvidence } = await timestampPdfWithTSA({
    signedPdfUrl,
    baseHash,
    relatedEvidenceId: signedEvidence.id,
  });

  /* =====================================================
   * 5️⃣ Blockchain Anchor (OpenTimestamps)
   * ===================================================== */
  if (!fs.existsSync(params.otsFilePath)) {
    throw new Error(`Arquivo .ots não encontrado: ${params.otsFilePath}`);
  }

  const otsBuffer = fs.readFileSync(params.otsFilePath);
  if (!otsBuffer.length) {
    throw new Error("Arquivo .ots vazio ou inválido");
  }

  const { anchorUrl, anchorEvidence } = await anchorProofPackage({
    baseHash,
    baseEvidenceId: reportEvidence.id, // 🔒 raiz da cadeia
    otsBuffer,
    relatedEntityType: "proof_package",
  });

  /* =====================================================
   * 6️⃣ Manifesto jurídico FINAL (JSON)
   * ===================================================== */
  const manifest = buildManifest({
    baseHash,
    periodStart: params.periodStart,
    periodEnd: params.periodEnd,
    evidences: {
      report: reportEvidence,
      pdf: { id: pdfEvidence.id, url: pdfUrl },
      signedPdf: { id: signedEvidence.id, url: signedPdfUrl },
      tsa: { id: tsaEvidence.id, url: tsaUrl },
      anchor: { id: anchorEvidence.id, url: anchorUrl },
    },
  });

  const manifestJson = JSON.stringify(manifest, null, 2);

  const manifestHash = crypto
    .createHash("sha256")
    .update(manifestJson)
    .digest("hex");

  // 🧾 Evidence de FECHAMENTO da cadeia
  const manifestEvidence = await createEvidence({
    hash: manifestHash,
    type: "manifest",
    relatedEntityType: "proof_package",
    relatedEntityId: reportEvidence.id, // ancora na raiz
  });

  if (params.manifestOutputPath) {
    fs.writeFileSync(params.manifestOutputPath, manifestJson, "utf-8");
  }

  /* =====================================================
   * 7️⃣ Assinatura + LTV do MANIFESTO (ENCERRAMENTO)
   * ===================================================== */
  const manifestFinal = await finalizeManifestProof({
    baseHash,
    manifest,
    relatedEvidenceId: manifestEvidence.id,
  });

  /* =====================================================
   * RESULTADO FINAL
   * ===================================================== */
  return {
    baseHash,
    manifestHash,

    evidences: {
      report: reportEvidence,
      pdf: pdfEvidence,
      signedPdf: signedEvidence,
      tsa: tsaEvidence,
      anchor: anchorEvidence,
      manifest: manifestEvidence,
      manifestSigned: manifestFinal.evidences.manifestSigned,
      manifestLtv: manifestFinal.evidences.manifestLtv,
    },

    urls: {
      pdf: pdfUrl,
      signedPdf: signedPdfUrl,
      tsa: tsaUrl,
      anchor: anchorUrl,
      manifestSigned: manifestFinal.manifestSignedPdfUrl,
      manifestLtv: manifestFinal.manifestLtvUrl,
      publicVerify: `https://doohplay.com/verify/${baseHash}`,
    },

    manifest,
  };
}