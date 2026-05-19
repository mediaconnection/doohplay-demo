// src/services/reports/runReportPipeline.ts
// 🔁 Pipeline oficial: Relatório → Hash → Evidence

import { generateConsolidatedReport } from "@/services/reports/generateConsolidatedReport";
import { getHashableReport } from "@/lib/getHashableReport";
import { sha256FromObject } from "@/lib/hash";
import { createEvidence } from "@/services/evidences/createEvidence";

interface RunReportPipelineParams {
  logs: Array<{
    player_id: string;
    duration_seconds: number;
    started_at: string;
  }>;
  periodStart: string;
  periodEnd: string;
}

/**
 * Executa o pipeline de geração de prova:
 * 1) Relatório consolidado (determinístico)
 * 2) Hash canônico (SHA-256)
 * 3) Criação da evidence (imutável / idempotente)
 */
export async function runReportPipeline(
  params: RunReportPipelineParams
) {
  // 0️⃣ Normalização defensiva (ordem determinística)
  const normalizedLogs = [...params.logs].sort((a, b) =>
    a.started_at.localeCompare(b.started_at)
  );

  // 1️⃣ Relatório consolidado
  const report = await generateConsolidatedReport({
    logs: normalizedLogs,
    periodStart: params.periodStart,
    periodEnd: params.periodEnd,
  });

  // 2️⃣ Hash canônico (exclui campos voláteis)
  const hashable = getHashableReport(report);
  const hash = sha256FromObject(hashable);

  // 3️⃣ Evidence raiz (idempotente por hash)
  const evidence = await createEvidence({
    hash,
    type: "report",
  });

  return {
    report,
    hash,
    evidence,
    context: {
      periodStart: params.periodStart,
      periodEnd: params.periodEnd,
      totalLogs: normalizedLogs.length,
    },
  };
}