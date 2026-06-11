import { NextRequest } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

const SCREEN_MAP = {
  "sp-01": { city: "Sao Paulo",      name: "Shopping Ibirapuera - Hall Central"     },
  "rj-01": { city: "Rio de Janeiro", name: "Shopping Rio Sul - Piso L2"             },
  "bh-01": { city: "Belo Horizonte", name: "BH Shopping - Entrada Principal"        },
  "ct-01": { city: "Curitiba",       name: "Shopping Muller - Praca de Alimentacao" },
  "rs-01": { city: "Porto Alegre",   name: "Shopping Iguatemi - Piso 2"             },
  "re-01": { city: "Recife",         name: "Shopping Recife - Corredor Central"     },
  "ss-01": { city: "Salvador",       name: "Shopping da Bahia - Terreo"             },
  "fo-01": { city: "Fortaleza",      name: "North Shopping - Entrada Sul"           },
  "ma-01": { city: "Manaus",         name: "Amazonas Shopping - Piso 1"             },
  "go-01": { city: "Goiania",        name: "Flamboyant Shopping - Hall Norte"       },
}

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
    for (let i = 0; i < screens.length; i++) {
      const sc = SCREEN_MAP[screens[i]]
      if (!sc) continue
      await pool.query(`INSERT INTO "CampaignScreen" ("campaignId", city, "screenId", "screenName") VALUES ($1, $2, $3, $4)`, [campaign.id, sc.city, screens[i], sc.name])
    }
  }
  return Response.json({ ok: true, campaign }, { status: 201 })
}
