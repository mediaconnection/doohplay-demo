import "@/app/api/_bootstrap";

import { NextRequest, NextResponse } from "next/server";
import { runReportPipeline } from "@/services/reports/runReportPipeline";
import { fetchPlaybackLogs } from "@/services/reports/fetchPlaybackLogs";
import { generateReportPdf } from "@/services/reports/generateReportPdf";

export async function POST(req: NextRequest) {
  const { periodStart, periodEnd } = await req.json();

  const logs = await fetchPlaybackLogs(periodStart, periodEnd);

  const { report, hash, evidence } = await runReportPipeline({
    logs,
    periodStart,
    periodEnd,
  });

  const pdf = await generateReportPdf({
    report,
    hash,
    reportEvidenceId: evidence.id,
  });

  return NextResponse.json({
    hash,
    reportEvidenceId: evidence.id,
    pdfUrl: pdf.pdfUrl,
  });
}