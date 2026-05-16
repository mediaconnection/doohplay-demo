import { generateConsolidatedReport } from "./generateConsolidatedReport";
import { getHashableReport } from "@/lib/getHashableReport";
import { sha256FromObject } from "@/lib/hash";

export function generateMonthlyReport(params: {
  logs: Array<{ playerId: string; mediaId: string; durationSeconds: number }>
  periodStart: string
  periodEnd: string
}) {
  const { logs, periodStart, periodEnd } = params

  const report = generateConsolidatedReport({ logs, periodStart, periodEnd });
  const hashable = getHashableReport(report);
  const reportHash = sha256FromObject(hashable);

  return { report, reportHash }
}
