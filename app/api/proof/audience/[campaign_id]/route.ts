import { NextRequest, NextResponse } from "next/server"

import { buildMerkleTree } from "@/lib/crypto/merkle"
import { pool } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type AudienceRow = {
  impression_id: string
  audience_hash: string | null
  viewer_count: number | string | null
  measured_at: string | Date | null
}

type MeasurementData = {
  impression_id: string
  audience_hash: string | null
  viewer_count: number
  measured_at: string | null
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

function safeNumber(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
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
        impression_id,
        audience_hash,
        viewer_count,
        measured_at
      FROM public.audience_measurements
      WHERE campaign_id = $1
      ORDER BY measured_at ASC NULLS LAST, impression_id ASC
      `,
      [campaignId]
    )

    const rows = result.rows as AudienceRow[]

    if (rows.length === 0) {
      return NextResponse.json({ error: "NO_AUDIENCE_DATA" }, { status: 404 })
    }

    const measurementsData: MeasurementData[] = rows.map((row) => {
      const normalizedHash = normalizeHash(row.audience_hash)

      return {
        impression_id: row.impression_id,
        audience_hash: normalizedHash,
        viewer_count: safeNumber(row.viewer_count),
        measured_at: toIsoOrNull(row.measured_at),
        hash_valid: Boolean(normalizedHash)
      }
    })

    const hashes = measurementsData
      .map((row) => row.audience_hash)
      .filter((hash): hash is string => Boolean(hash))

    if (hashes.length === 0) {
      return NextResponse.json(
        { error: "NO_VALID_AUDIENCE_HASHES" },
        { status: 422 }
      )
    }

    const merkle = buildMerkleTree(hashes)

    const totalAudience = measurementsData.reduce(
      (acc, row) => acc + row.viewer_count,
      0
    )

    return NextResponse.json(
      {
        ok: true,
        campaign_id: campaignId,
        measurements: rows.length,
        valid_measurements: hashes.length,
        invalid_measurements: rows.length - hashes.length,
        total_audience: totalAudience,
        merkle_root: merkle.root,
        measurements_data: measurementsData,
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
    console.error("AUDIENCE_PROOF_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        ok: false,
        error: "AUDIENCE_PROOF_FAILED",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}