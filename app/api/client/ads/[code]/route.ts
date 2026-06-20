// app/api/client/ads/[code]/route.ts
// Anúncios REAIS de terceiros vinculados a esta tela via CampaignScreen —
// substitui o array mockado (Bradesco/iFood/Natura) que existia antes na
// aba "Anúncios" do dashboard.
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const upperCode = code.toUpperCase()
  const pool = getPool()
  try {
    const { rows } = await pool.query(`
      SELECT
        c.id                              AS campaign_id,
        c.name                            AS campaign_name,
        a.name                            AS advertiser_name,
        c."startDate"::text               AS start_date,
        c."endDate"::text                 AS end_date,
        CASE
          WHEN c.status = 'active'
            AND c."startDate" <= NOW()
            AND c."endDate" >= NOW()
          THEN 'Ativo'
          ELSE 'Pausado'
        END                               AS status,
        COALESCE((
          SELECT COUNT(*) FROM display_events de
          JOIN "CampaignMedia" cm2 ON cm2.id::text = de.media_id::text
          WHERE cm2."campaignId" = c.id
        ), 0)                             AS views
      FROM "CampaignScreen" cs
      JOIN "Campaign" c ON c.id = cs."campaignId"
      JOIN "Advertiser" a ON a.code = c."advertiserCode"
      WHERE cs."screenId" = $1
      ORDER BY c."startDate" DESC
    `, [upperCode])
    return NextResponse.json({ ads: rows })
  } catch (err) {
    console.error("[client/ads GET]", err)
    return NextResponse.json({ ads: [], error: String(err) }, { status: 500 })
  }
}
