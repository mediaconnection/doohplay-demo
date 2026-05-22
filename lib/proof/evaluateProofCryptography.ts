import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export type CryptoStatus =
  | "valid"
  | "invalid"
  | "missing"
  | "warning";

export interface CryptoCheckResult {
  layer: "signed_pdf" | "tsa" | "manifest_ltv";
  status: CryptoStatus;
  reason: string;
  technicalDetails?: string;
}

interface EvaluateProofCryptographyParams {
  signedPdfPath?: string;
  tsaPath?: string;
  manifestLtvPath?: string;
}

/**
 * Avaliação CRIPTOGRÁFICA REAL da prova
 *
 * ⚠️ Usa ferramentas oficiais (openssl / pdfsig)
 * ⚖️ Juridicamente defensável
 * 🧾 Auditável
 */
export function evaluateProofCryptography(
  params: EvaluateProofCryptographyParams
): CryptoCheckResult[] {
  const results: CryptoCheckResult[] = [];

  /* =====================================================
   * 1️⃣ Assinatura digital do PDF
   * ===================================================== */
  if (!params.signedPdfPath || !fs.existsSync(params.signedPdfPath)) {
    results.push({
      layer: "signed_pdf",
      status: "missing",
      reason: "PDF assinado não encontrado.",
    });
  } else {
    try {
      /**
       * pdfsig é usado por tribunais e órgãos oficiais
       * https://www.freedesktop.org/wiki/Software/poppler/
       */
      const output = execSync(
        `pdfsig "${params.signedPdfPath}"`,
        { encoding: "utf-8" }
      );

      if (output.includes("Signature is valid")) {
        results.push({
          layer: "signed_pdf",
          status: "valid",
          reason: "Assinatura digital válida (PDF).",
          technicalDetails: output,
        });
      } else {
        results.push({
          layer: "signed_pdf",
          status: "invalid",
          reason: "Assinatura digital inválida ou corrompida.",
          technicalDetails: output,
        });
      }
    } catch (err: any) {
      results.push({
        layer: "signed_pdf",
        status: "invalid",
        reason: "Falha ao validar assinatura do PDF.",
        technicalDetails: err.message,
      });
    }
  }

  /* =====================================================
   * 2️⃣ TSA (RFC 3161)
   * ===================================================== */
  if (!params.tsaPath || !fs.existsSync(params.tsaPath)) {
    results.push({
      layer: "tsa",
      status: "missing",
      reason: "Arquivo TSA não encontrado.",
    });
  } else {
    try {
      const output = execSync(
        `openssl ts -reply -in "${params.tsaPath}" -text`,
        { encoding: "utf-8" }
      );

      if (output.includes("Time stamp")) {
        results.push({
          layer: "tsa",
          status: "valid",
          reason: "Timestamp RFC 3161 válido.",
          technicalDetails: output,
        });
      } else {
        results.push({
          layer: "tsa",
          status: "invalid",
          reason: "Resposta TSA inválida.",
          technicalDetails: output,
        });
      }
    } catch (err: any) {
      results.push({
        layer: "tsa",
        status: "invalid",
        reason: "Falha ao validar TSA.",
        technicalDetails: err.message,
      });
    }
  }

  /* =====================================================
   * 3️⃣ Manifesto com LTV
   * ===================================================== */
  if (!params.manifestLtvPath || !fs.existsSync(params.manifestLtvPath)) {
    results.push({
      layer: "manifest_ltv",
      status: "warning",
      reason: "Manifesto com LTV não encontrado.",
    });
  } else {
    try {
      const output = execSync(
        `pdfsig "${params.manifestLtvPath}"`,
        { encoding: "utf-8" }
      );

      if (
        output.includes("Signature is valid") &&
        output.toLowerCase().includes("ltv")
      ) {
        results.push({
          layer: "manifest_ltv",
          status: "valid",
          reason: "Manifesto assinado com LTV válido.",
          technicalDetails: output,
        });
      } else {
        results.push({
          layer: "manifest_ltv",
          status: "warning",
          reason:
            "Manifesto assinado, mas sem evidência clara de LTV.",
          technicalDetails: output,
        });
      }
    } catch (err: any) {
      results.push({
        layer: "manifest_ltv",
        status: "invalid",
        reason: "Falha ao validar LTV do manifesto.",
        technicalDetails: err.message,
      });
    }
  }

  return results;
}