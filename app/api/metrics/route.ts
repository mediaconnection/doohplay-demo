export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server"

export function GET() {
  return NextResponse.json(getMetrics())
}

