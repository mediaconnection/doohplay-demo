import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function normalizeHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return /^[a-f0-9]{64}$/.test(normalized) ? normalized : null
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ hash: string }> }
) {
  try {
    const { hash: rawHash } = await context.params
    const hash = normalizeHash(rawHash)

    if (!hash) {
      return NextResponse.json(
        { error: "INVALID_HASH" },
        { status: 400 }
      )
    }

    const { rows } = await pool.query(
      `
      select *
      from public.event_chain
      where lower(replace(event_hash, '0x', '')) = $1
      limit 1
      `,
      [hash]
    )

    const event = rows[0]

    if (!event) {
      return NextResponse.json(
        { error: "EVENT_NOT_FOUND" },
        { status: 404 }
      )
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error("LEDGER_HASH_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "LEDGER_FETCH_FAILED",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}