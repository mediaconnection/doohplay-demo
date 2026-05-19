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
  req: NextRequest,
  context: { params: Promise<{ block_hash: string }> }
) {
  try {
    const { block_hash } = await context.params
    const normalized = normalizeHash(block_hash)

    if (!normalized) {
      return NextResponse.json({ error: "INVALID_BLOCK_HASH" }, { status: 400 })
    }

    const { rows } = await pool.query(
      `
      select *
      from public.event_blocks
      where lower(replace(block_hash, '0x', '')) = $1
      limit 1
      `,
      [normalized]
    )

    if (!rows[0]) {
      return NextResponse.json({ error: "BLOCK_NOT_FOUND" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      block: rows[0]
    })
  } catch (error) {
    console.error("PROOF_BLOCK_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "PROOF_BLOCK_FAILED",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}