import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

async function checkAuth(req: NextRequest) {
  const session = await getServerSession()
  const secret = req.nextUrl.searchParams.get("secret")
  return !!session?.user || (secret && secret === process.env.ADMIN_SECRET)
}

// GET — lista todos os templates configurados
export async function GET(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const pool = getPool()
  const { rows } = await pool.query(
    `SELECT id, client_code, screen_id, template_key, transition_effect, widget_layout_mode, location_lat, location_lon,
            location_name, stock_tickers, news_country, active, created_at
     FROM screen_templates ORDER BY created_at DESC`
  )
  return NextResponse.json({ count: rows.length, items: rows })
}

// POST — cria/atualiza o template de um cliente (screen_id sempre NULL por
// enquanto — configuração por tela específica é uma extensão futura)
export async function POST(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  try {
    const body = await req.json()
    const clientCode = String(body.client_code || "").toUpperCase()
    const templateKey = body.template_key === "magazine" ? "magazine" : "fullscreen"
    const transitionEffect = ["fade", "cortina", "deslizar", "none"].includes(body.transition_effect) ? body.transition_effect : "fade"
    // Fase 39 (20/07/2026): widgets fixos (padrão) ou revezando em pares
    // (hora+clima, bolsa+economia) — validado igual aos outros campos
    // fechados, nunca aceita valor arbitrário do body.
    const widgetLayoutMode = ["fixed", "revezando", "compacto"].includes(body.widget_layout_mode) ? body.widget_layout_mode : "fixed"
    const locationLat = body.location_lat ?? null
    const locationLon = body.location_lon ?? null
    const locationName = body.location_name || null
    const stockTickers = Array.isArray(body.stock_tickers) && body.stock_tickers.length
      ? body.stock_tickers : ["PETR4", "VALE3", "MGLU3", "ITUB4"]

    if (!clientCode) return NextResponse.json({ error: "client_code é obrigatório" }, { status: 400 })

    const pool = getPool()
    const existing = await pool.query(
      `SELECT id FROM screen_templates WHERE client_code = $1 AND screen_id IS NULL LIMIT 1`,
      [clientCode]
    )

    let row
    if (existing.rows[0]) {
      const res = await pool.query(
        `UPDATE screen_templates
         SET template_key = $1, location_lat = $2, location_lon = $3,
             location_name = $4, stock_tickers = $5, active = true, updated_at = NOW(),
             layout_template_id = NULL, transition_effect = $7, widget_layout_mode = $8
         WHERE id = $6
         RETURNING *`,
        [templateKey, locationLat, locationLon, locationName, stockTickers, existing.rows[0].id, transitionEffect, widgetLayoutMode]
      )
      row = res.rows[0]
    } else {
      const res = await pool.query(
        `INSERT INTO screen_templates
           (client_code, template_key, location_lat, location_lon, location_name, stock_tickers, transition_effect, widget_layout_mode)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING *`,
        [clientCode, templateKey, locationLat, locationLon, locationName, stockTickers, transitionEffect, widgetLayoutMode]
      )
      row = res.rows[0]
    }

    return NextResponse.json({ ok: true, ...row })
  } catch (err: any) {
    console.error("[admin/screen-templates POST]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
