import { NextRequest, NextResponse } from "next/server"

import { buildMerkleTree } from "@/lib/crypto/merkle"
import { pool } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type ImpressionRow = {
  impression_id: string
  impression_hash: string | null
  screen_id: string | null
  played_at: string | Date | null
}

type Impression = {
  impression_id: string
  impression_hash: string | null
  normalized_hash: string | null
  screen_id: string | null
  played_at: string | null
  hash_valid: boolean
}

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
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
        impression_id::text AS impression_id,
        impression_hash,
        screen_id::text AS screen_id,
        played_at
      FROM public.impressions
      WHERE campaign_id::text = $1
      ORDER BY played_at ASC NULLS LAST, impression_id ASC
      `,
      [campaignId]
    )

    const rows = result.rows as ImpressionRow[]

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "NO_IMPRESSIONS_FOUND" },
        { status: 404 }
      )
    }

    const impressions: Impression[] = rows.map((item) => {
      const normalizedHash = normalizeHash(item.impression_hash)

      return {
        impression_id: item.impression_id,
        impression_hash: item.impression_hash,
        normalized_hash: normalizedHash,
        screen_id: item.screen_id,
        played_at: toIsoOrNull(item.played_at),
        hash_valid: Boolean(normalizedHash)
      }
    })

    const hashes = impressions
      .map((item) => item.normalized_hash)
      .filter((hash): hash is string => hash !== null)

    if (hashes.length === 0) {
      return NextResponse.json(
        { error: "NO_VALID_IMPRESSION_HASHES" },
        { status: 422 }
      )
    }

    const merkle = buildMerkleTree(hashes)

    return NextResponse.json(
      {
        ok: true,
        campaign_id: campaignId,
        impression_count: impressions.length,
        valid_impression_count: hashes.length,
        invalid_impression_count: impressions.length - hashes.length,
        merkle_root: merkle.root,
        impressions,
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
    console.error("PROOF_IMPRESSIONS_CAMPAIGN_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        ok: false,
        error: "PROOF_IMPRESSIONS_CAMPAIGN_FAILED",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}