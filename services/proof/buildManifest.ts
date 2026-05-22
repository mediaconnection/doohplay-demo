export function buildManifest(params: {
  baseHash: string;
  periodStart: string;
  periodEnd: string;

  evidences: {
    report: { id: string };
    pdf: { id: string; url: string };
    signedPdf: { id: string; url: string };
    tsa: { id: string; url: string };
    anchor: { id: string; url: string };
  };
}) {
  return {
    manifest_version: "1.0",
    platform: "DOOHPLAY",
    generated_at: new Date().toISOString(),
    timezone: "UTC",

    subject: {
      type: "dooh_play_report",
      period: {
        start: params.periodStart,
        end: params.periodEnd,
      },
    },

    hashes: {
      base_hash: params.baseHash,
    },

    artifacts: {
      report: {
        hash: params.baseHash,
        evidence_id: params.evidences.report.id,
      },

      pdf: {
        url: params.evidences.pdf.url,
        evidence_id: params.evidences.pdf.id,
      },

      signed_pdf: {
        url: params.evidences.signedPdf.url,
        evidence_id: params.evidences.signedPdf.id,
        signature_type: "A1-ICP-BRASIL",
      },

      tsa: {
        url: params.evidences.tsa.url,
        provider: "RFC3161",
        evidence_id: params.evidences.tsa.id,
      },

      blockchain_anchor: {
        url: params.evidences.anchor.url,
        method: "OpenTimestamps / Bitcoin",
        evidence_id: params.evidences.anchor.id,
      },
    },

    verification: {
      public_url: `https://doohplay.com/verify/${params.baseHash}`,
      offline_steps: [
        "Recalcular SHA-256 do relatório",
        "Comparar com base_hash",
        "Validar assinatura A1",
        "Validar TSA RFC 3161",
        "Verificar âncora OpenTimestamps",
      ],
    },

    legal: {
      integrity: "cryptographically guaranteed",
      non_repudiation: true,
      chain_of_custody: "continuous",
      jurisdiction: "Brazil",
      standards: [
        "SHA-256",
        "ICP-Brasil",
        "RFC 3161",
        "OpenTimestamps",
      ],
    },
  };
}