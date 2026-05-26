export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server"


export const runtime = "nodejs"

type EventHashRow = {
  event_hash: string | null
}

function normalizeHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return /^[a-f0-9]{64}$/.test(normalized) ? normalized : null
}

export async function GET() {
    const { pool } = await import("@/lib/db")

    const { buildMerkleRoot } = await import("@/lib/proof/merkle")

  try {
    const res = await pool.query(
      `
      SELECT event_hash
      FROM public.event_chain
      WHERE event_hash IS NOT NULL
      ORDER BY occurred_at ASC NULLS LAST, event_id ASC
      `
    )

    const rows = res.rows as EventHashRow[]

    const hashes = rows
      .map((row) => normalizeHash(row.event_hash))
      .filter((value): value is string => Boolean(value))

    if (!hashes.length) {
      return NextResponse.json(
        {
          ok: false,
          error: "EMPTY_LEDGER",
          merkle_root: null,
          total_events: 0
        },
        { status: 404 }
      )
    }

    const root = buildMerkleRoot(hashes)

    return NextResponse.json({
      ok: true,
      merkle_root: root,
      total_events: hashes.length,
      generated_at: new Date().toISOString()
    })
  } catch (error) {
    console.error("AUDIT_MERKLE_ROOT_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        ok: false,
        error: "INTERNAL_ERROR",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
