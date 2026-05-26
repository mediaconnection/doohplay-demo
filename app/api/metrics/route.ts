export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server"
import { getMetrics } from "@/lib/observability/metrics"

export function GET() {
  return NextResponse.json(getMetrics())
}

