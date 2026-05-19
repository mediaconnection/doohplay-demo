import { NextRequest, NextResponse } from "next/server"

import { pool } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type EventChainRow = {
  event_id: string
  event_type: string | null
  occurred_at: string | Date | null
  event_hash: string
  previous_event_hash: string | null
}

type ChainNeighborRow = {
  event_id: string
  event_hash: string
}

function normalizeHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/^0x/, "")

  return /^[a-f0-9]{64}$/.test(normalized) ? normalized : null
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ hash: string }> }
) {
  void req

  try {
    const { hash } = await context.params
    const normalizedHash = normalizeHash(hash)

    if (!normalizedHash) {
      return NextResponse.json({ error: "INVALID_HASH" }, { status: 400 })
    }

    const eventRes = await pool.query(
      `
      SELECT
        event_id::text AS event_id,
        event_type,
        occurred_at,
        event_hash,
        previous_event_hash
      FROM public.event_chain
      WHERE lower(replace(event_hash, '0x', '')) = $1
      LIMIT 1
      `,
      [normalizedHash]
    )

    const eventRows = eventRes.rows as EventChainRow[]
    const event = eventRows[0]

    if (!event) {
      return NextResponse.json({ error: "EVENT_NOT_FOUND" }, { status: 404 })
    }

    const previousRes = event.previous_event_hash
      ? await pool.query(
          `
          SELECT
            event_id::text AS event_id,
            event_hash
          FROM public.event_chain
          WHERE lower(replace(event_hash, '0x', '')) = lower(replace($1, '0x', ''))
          LIMIT 1
          `,
          [event.previous_event_hash]
        )
      : { rows: [] }

    const nextRes = await pool.query(
      `
      SELECT
        event_id::text AS event_id,
        event_hash
      FROM public.event_chain
      WHERE lower(replace(previous_event_hash, '0x', '')) = lower(replace($1, '0x', ''))
      LIMIT 1
      `,
      [event.event_hash]
    )

    const previousRows = previousRes.rows as ChainNeighborRow[]
    const nextRows = nextRes.rows as ChainNeighborRow[]

    return NextResponse.json({
      event,
      previous: previousRows[0] ?? null,
      next: nextRows[0] ?? null
    })
  } catch (error) {
    console.error("EVENT_CHAIN_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "EVENT_CHAIN_FAILED",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}