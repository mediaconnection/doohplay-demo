import { ConsolidatedReport } from "@/domain/reports/consolidatedReport";

export function getHashableReport(report: ConsolidatedReport) {
  const { generatedAt, ...rest } = report;
  return rest;
}