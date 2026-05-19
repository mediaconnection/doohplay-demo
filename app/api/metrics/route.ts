import { NextResponse } from "next/server"
import { getMetrics } from "@/lib/observability/metrics"

export function GET() {
  return NextResponse.json(getMetrics())
}