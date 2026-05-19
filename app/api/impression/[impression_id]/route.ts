import { NextRequest, NextResponse } from "next/server"

import { pool } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ impression_id: string }> }
) {
  try {
    const { impression_id } = await context.params
    const impressionId = safeString(impression_id)

    if (!impressionId) {
      return NextResponse.json(
        { success: false, error: "IMPRESSION_ID_REQUIRED" },
        { status: 400 }
      )
    }

    const impressionRes = await pool.query(
      `
      select *
      from public.play_logs
      where id::text = $1
      limit 1
      `,
      [impressionId]
    )

    if (impressionRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "IMPRESSION_NOT_FOUND" },
        { status: 404 }
      )
    }

    const impression = impressionRes.rows[0]

    const chainRes = await pool.query(
      `
      select
        event_hash,
        previous_event_hash,
        created_at
      from public.event_chain
      where payload->>'impression_id' = $1
      limit 1
      `,
      [impressionId]
    )

    return NextResponse.json(
      {
        success: true,
        impression_id: impressionId,
        impression,
        proof: chainRes.rows[0] ?? null
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("IMPRESSION_PROOF_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "INTERNAL_ERROR"
      },
      { status: 500 }
    )
  }
}