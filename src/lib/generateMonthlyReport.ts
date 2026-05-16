import { generateConsolidatedReport } from "./generateConsolidatedReport";
import { getHashableReport } from "@/lib/getHashableReport";
import { sha256FromObject } from "@/lib/hash";

export function generateMonthlyReport(params: {
  logs: Array<{ player_id: string; duration_seconds: number; started_at: string }>
  periodStart: string
  periodEnd: string
}) {
  const { logs, periodStart, periodEnd } = params

  const report = generateConsolidatedReport({ logs, periodStart, periodEnd });
  const hashable = getHashableReport(report);
  const reportHash = sha256FromObject(hashable);

  return { report, reportHash }
}
