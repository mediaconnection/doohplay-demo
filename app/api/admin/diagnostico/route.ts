// app/api/admin/diagnostico/route.ts
// Consolida, numa única chamada, os campos-chave de um código (cliente,
// anunciante ou campanha) que antes exigiam várias queries manuais no
// Supabase a cada investigação — fonte de pelo menos 2 erros nesta sessão
// (placeholder colado por engano, SQL confundido com comando de shell).
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const session = await getServerSession()
  const { searchParams } = req.nextUrl
  const secret = searchParams.get("secret")
  const isNextAuth = !!session?.user
  const isLegacy = secret && secret === process.env.ADMIN_SECRET
  if (!isNextAuth && !isLegacy) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const code = (searchParams.get("code") || "").trim().toUpperCase()
  if (!code) {
    return NextResponse.json({ error: "parâmetro 'code' obrigatório" }, { status: 400 })
  }

  const pool = getPool()
  const result: any = { code, found_as: [] }

  try {
    // ── Tenta como código de cliente (studio_clients) ──────────────────
    const client = await pool.query(
      `SELECT code, name, city, phone, active, player_id, created_at
       FROM studio_clients WHERE UPPER(code) = $1 LIMIT 1`,
      [code]
    )
    if (client.rows[0]) {
      result.found_as.push("cliente")
      result.client = client.rows[0]

      const heartbeat = await pool.query(
        `SELECT id, last_ping, status FROM players WHERE id = $1 LIMIT 1`,
        [client.rows[0].player_id]
      ).catch(() => ({ rows: [] }))
      result.heartbeat = heartbeat.rows[0] ?? null
      if (result.heartbeat?.last_ping) {
        const minutesAgo = (Date.now() - new Date(result.heartbeat.last_ping).getTime()) / 60000
        result.heartbeat.minutes_since_last_ping = Math.round(minutesAgo)
        result.heartbeat.likely_offline = minutesAgo > 5
      }

      const mediaCount = await pool.query(
        `SELECT COUNT(*) FROM "CampaignMedia" cm
         JOIN "Campaign" c ON c.id = cm."campaignId"
         WHERE c."advertiserCode" = $1`,
        [code]
      ).catch(() => ({ rows: [{ count: null }] }))
      result.media_count = Number(mediaCount.rows[0]?.count ?? null)
    }

    // ── Tenta como código de anunciante (Advertiser) ───────────────────
    const advertiser = await pool.query(
      `SELECT code, name, email, phone, "cpfCnpj", city, segment, "createdAt"
       FROM "Advertiser" WHERE UPPER(code) = $1 LIMIT 1`,
      [code]
    )
    if (advertiser.rows[0]) {
      result.found_as.push("anunciante")
      result.advertiser = advertiser.rows[0]
      result.advertiser_ready_to_bill =
        !!advertiser.rows[0].email && !!advertiser.rows[0].cpfCnpj

      const campaigns = await pool.query(
        `SELECT id, name, status, budget, "startDate", "endDate"
         FROM "Campaign" WHERE "advertiserCode" = $1
         ORDER BY "createdAt" DESC LIMIT 10`,
        [code]
      )
      result.campaigns = campaigns.rows
    }

    // ── Tenta como UUID de campanha ─────────────────────────────────────
    const campaignById = await pool.query(
      `SELECT id, "advertiserCode", name, status, budget, "startDate", "endDate"
       FROM "Campaign" WHERE id = $1 LIMIT 1`,
      [searchParams.get("code") || ""] // mantém case original para UUID
    ).catch(() => ({ rows: [] }))
    if (campaignById.rows[0]) {
      result.found_as.push("campanha")
      result.campaign = campaignById.rows[0]
      const payment = await pool.query(
        `SELECT status, value, paid_at, invoice_url FROM campaign_payments
         WHERE campaign_id::text = $1 ORDER BY created_at DESC LIMIT 1`,
        [campaignById.rows[0].id]
      ).catch(() => ({ rows: [] }))
      result.payment = payment.rows[0] ?? null
    }

    if (result.found_as.length === 0) {
      return NextResponse.json({ error: "Nada encontrado para este código", code }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (err: any) {
    console.error("[admin/diagnostico]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
