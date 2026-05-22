// src/app/api/reports/run/route.ts
import "@/app/api/_bootstrap";

import { NextRequest, NextResponse } from "next/server";
import { runReportPipeline } from "@/services/reports/runReportPipeline";
import { fetchPlaybackLogs } from "@/services/reports/fetchPlaybackLogs";

export async function POST(req: NextRequest) {
  const { periodStart, periodEnd } = await req.json();

  // Busca logs (server-side)
  const logs = await fetchPlaybackLogs(periodStart, periodEnd);

  // Executa pipeline
  const result = await runReportPipeline({
    logs,
    periodStart,
    periodEnd,
  });

  return NextResponse.json(result);
}