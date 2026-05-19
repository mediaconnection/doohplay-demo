import { NextRequest, NextResponse } from "next/server"

import { pool } from "@/lib/db"
import { buildMerkleTree } from "@/lib/merkle"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type CampaignEventRow = {
  event_id: string
  event_hash: string | null
  block_height: number | string | null
  occurred_at: string | Date | null
}

type CampaignEvent = {
  event_id: string
  event_hash: string | null
  normalized_hash: string | null
  block_height: number | null
  occurred_at: string | null
  hash_valid: boolean
}

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function safeNumber(value: unknown): number | null {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function normalizeHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return /^[a-f0-9]{64}$/.test(normalized) ? normalized : null
}

function toIsoOrNull(value: string | Date | null): string | null {
  if (!value) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ campaign_id: string }> }
) {
  void req

  try {
    const { campaign_id } = await context.params
    const campaignId = safeString(campaign_id)

    if (!campaignId) {
      return NextResponse.json(
        { error: "INVALID_CAMPAIGN_ID" },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `
      SELECT
        event_id::text AS event_id,
        event_hash,
        block_height,
        occurred_at
      FROM public.event_chain
      WHERE campaign_id::text = $1
         OR payload->>'campaign_id' = $1
      ORDER BY occurred_at ASC NULLS LAST, event_id ASC
      `,
      [campaignId]
    )

    const rows = result.rows as CampaignEventRow[]

    if (rows.length === 0) {
      return NextResponse.json({ error: "NO_EVENTS_FOUND" }, { status: 404 })
    }

    const events: CampaignEvent[] = rows.map((event) => {
      const normalizedHash = normalizeHash(event.event_hash)

      return {
        event_id: event.event_id,
        event_hash: event.event_hash,
        normalized_hash: normalizedHash,
        block_height: safeNumber(event.block_height),
        occurred_at: toIsoOrNull(event.occurred_at),
        hash_valid: Boolean(normalizedHash)
      }
    })

    const hashes = events
      .map((event) => event.normalized_hash)
      .filter((hash): hash is string => Boolean(hash))

    if (hashes.length === 0) {
      return NextResponse.json(
        { error: "NO_VALID_EVENT_HASHES" },
        { status: 422 }
      )
    }

    const merkle = buildMerkleTree(hashes)

    return NextResponse.json(
      {
        ok: true,
        campaign_id: campaignId,
        event_count: rows.length,
        valid_event_count: hashes.length,
        invalid_event_count: rows.length - hashes.length,
        merkle_root: merkle.root,
        events,
        meta: {
          generated_at: new Date().toISOString()
        }
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    )
  } catch (error) {
    console.error("PROOF_CAMPAIGN_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        ok: false,
        error: "PROOF_CAMPAIGN_FAILED",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}