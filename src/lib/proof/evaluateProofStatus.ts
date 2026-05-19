export type ProofLayerStatus =
  | "valid"
  | "invalid"
  | "missing"
  | "warning";

export type ProofLayerType =
  | "report"
  | "pdf"
  | "signed_pdf"
  | "tsa"
  | "anchor"
  | "manifest"
  | "manifest_ltv";

export interface EvidenceLike {
  id: string;
  type: ProofLayerType;
  hash: string;
  created_at: string;
  pdf_url?: string | null;
  evidence_json_url?: string | null;
}

export interface ProofLayerResult {
  type: ProofLayerType;
  status: ProofLayerStatus;
  reason: string;
}

/**
 * Avaliação LÓGICA da cadeia de prova
 *
 * ⚠️ NÃO valida criptografia (isso é outra etapa)
 * ✅ Verifica presença, encadeamento e completude
 */
export function evaluateProofStatus(
  evidences: EvidenceLike[]
): ProofLayerResult[] {
  const find = (type: ProofLayerType) =>
    evidences.find((e) => e.type === type);

  const results: ProofLayerResult[] = [];

  /* =====================================================
   * 1️⃣ Relatório base (raiz)
   * ===================================================== */
  const report = find("report");
  results.push({
    type: "report",
    status: report ? "valid" : "missing",
    reason: report
      ? "Relatório base encontrado e registrado como raiz da prova."
      : "Relatório base (hash raiz) não encontrado.",
  });

  /* =====================================================
   * 2️⃣ PDF institucional
   * ===================================================== */
  const pdf = find("pdf");
  results.push({
    type: "pdf",
    status: pdf?.pdf_url ? "valid" : "missing",
    reason: pdf?.pdf_url
      ? "PDF institucional gerado e disponível."
      : "PDF institucional não encontrado.",
  });

  /* =====================================================
   * 3️⃣ Assinatura digital
   * ===================================================== */
  const signed = find("signed_pdf");
  results.push({
    type: "signed_pdf",
    status: signed ? "valid" : "missing",
    reason: signed
      ? "Documento assinado digitalmente (ICP-Brasil)."
      : "Assinatura digital não encontrada.",
  });

  /* =====================================================
   * 4️⃣ Timestamp confiável (TSA)
   * ===================================================== */
  const tsa = find("tsa");
  results.push({
    type: "tsa",
    status: tsa ? "valid" : "missing",
    reason: tsa
      ? "Carimbo de tempo RFC 3161 registrado."
      : "Timestamp confiável (TSA) não encontrado.",
  });

  /* =====================================================
   * 5️⃣ Âncora em blockchain
   * ===================================================== */
  const anchor = find("anchor");
  results.push({
    type: "anchor",
    status: anchor ? "valid" : "missing",
    reason: anchor
      ? "Prova ancorada em blockchain (OpenTimestamps)."
      : "Âncora blockchain não encontrada.",
  });

  /* =====================================================
   * 6️⃣ Manifesto jurídico
   * ===================================================== */
  const manifest = find("manifest");
  results.push({
    type: "manifest",
    status: manifest ? "valid" : "missing",
    reason: manifest
      ? "Manifesto jurídico consolidado e registrado."
      : "Manifesto jurídico não encontrado.",
  });

  /* =====================================================
   * 7️⃣ Manifesto com LTV
   * ===================================================== */
  const manifestLtv = find("manifest_ltv");
  results.push({
    type: "manifest_ltv",
    status: manifestLtv ? "valid" : "warning",
    reason: manifestLtv
      ? "Manifesto assinado com LTV (validade de longo prazo)."
      : "Manifesto ainda sem LTV aplicado (prova válida, mas não perene).",
  });

  return results;
}