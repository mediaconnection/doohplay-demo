import { NextRequest } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const pool = getPool()
  const parts = req.nextUrl.pathname.split("/")
  const idx = parts.indexOf("advertiser")
  const code = idx >= 0 ? parts[idx + 1].toUpperCase() : ""
  const body = await req.json()
  const name = body.name
  const startDate = body.startDate
  const endDate = body.endDate
  const budget = body.budget
  const screens = body.screens
  if (!name || !startDate || !endDate) {
    return Response.json({ error: "name, startDate e endDate sao obrigatorios" }, { status: 400 })
  }
  const adv = await pool.query(`SELECT id FROM "Advertiser" WHERE code = $1 LIMIT 1`, [code])
  if (!adv.rows[0]) return Response.json({ error: "Anunciante nao encontrado" }, { status: 404 })
  const res = await pool.query(
    `INSERT INTO "Campaign" ("advertiserCode", name, status, "startDate", "endDate", budget, impressions) VALUES ($1, $2, 'active', $3::date, $4::date, $5, 0) RETURNING *`,
    [code, name.trim(), startDate, endDate, budget ? Number(budget) : 0]
  )
  const campaign = res.rows[0]
  if (Array.isArray(screens) && screens.length > 0) {
    // Valida contra telas REAIS (studio_clients ativos) — antes isso usava
    // uma lista fixa de shoppings fictícios, sem nenhuma ligação com telas
    // de clientes de verdade.
    const realScreens = await pool.query(
      `SELECT code, name, city FROM studio_clients WHERE code = ANY($1) AND active = true`,
      [screens.map((s: string) => String(s).toUpperCase())]
    )
    for (const sc of realScreens.rows) {
      await pool.query(
        `INSERT INTO "CampaignScreen" ("campaignId", city, "screenId", "screenName") VALUES ($1, $2, $3, $4)`,
        [campaign.id, sc.city, sc.code, sc.name]
      )
    }
  }
  return Response.json({ ok: true, campaign }, { status: 201 })
}
