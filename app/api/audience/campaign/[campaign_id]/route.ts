import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ campaign_id: string }> }
) {
  try {
    const { campaign_id } = await context.params

    if (!campaign_id) {
      return NextResponse.json(
        { error: "INVALID_CAMPAIGN_ID" },
        { status: 400 }
      )
    }

    const res = await pool.query(
      `
      SELECT
        COALESCE(SUM(detected_faces), 0) as reach,
        COALESCE(AVG(attention_score), 0) as avg_attention,
        COALESCE(AVG(avg_dwell_time), 0) as avg_dwell,
        COUNT(*) as events
      FROM public.audience_events
      WHERE campaign_id = $1
      `,
      [campaign_id]
    )

    return NextResponse.json(res.rows[0] ?? {})
  } catch (error) {
    console.error("AUDIENCE_CAMPAIGN_ROUTE_ERROR", error)

    return NextResponse.json(
      { error: "FAILED_TO_FETCH_CAMPAIGN" },
      { status: 500 }
    )
  }
}