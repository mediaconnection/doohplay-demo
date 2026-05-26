export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"

export const runtime = "nodejs"

type LedgerRow = {
  event_id: string
  event_type: string | null
  occurred_at: string | Date | null
}

export async function GET(_req: NextRequest) {
  try {
    const result = await pool.query(
      `
      select
        event_id,
        event_type,
        occurred_at
      from public.event_chain
      order by occurred_at desc nulls last
      limit 100
      `
    )

    const rows = result.rows as LedgerRow[]

    return NextResponse.json(rows)
  } catch (error) {
    console.error("LEDGER_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "LEDGER_FETCH_FAILED",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
