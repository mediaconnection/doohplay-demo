// app/api/agency/[code]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code: rawCode } = await params
  const code = rawCode?.toUpperCase()

  if (!code) return NextResponse.json({ error: "Código inválido" }, { status: 400 })

  const pool = getPool()
  try {
    const agRes = await pool.query(
      `SELECT id::text, code, name, phone, email, created_at::text
       FROM agencies WHERE UPPER(code) = $1 LIMIT 1`,
      [code]
    )
    if (!agRes.rows[0]) return NextResponse.json({ error: "Agência não encontrada" }, { status: 404 })
    const agency = agRes.rows[0]

    const clientsRes = await pool.query(`
      SELECT
        sc.code,
        sc.name,
        sc.business_type,
        sc.address,
        sc.city,
        sc.phone,
        sc.email,
        sc.player_id::text,
        sc.active,
        p.last_ping::text,
        CASE
          WHEN p.last_ping IS NOT NULL
            AND (NOW() - p.last_ping) < INTERVAL '3 minutes'
          THEN true
          ELSE false
        END AS online,
        COALESCE(de.plays_today, 0)    AS plays_today,
        COALESCE(de.plays_month, 0)    AS plays_month,
        COALESCE(cs.value, 0)::float   AS revenue_month,
        cs.plan,
        cs.status AS subscription_status
      FROM agency_clients ac
      JOIN studio_clients sc ON sc.code = ac.client_code
      LEFT JOIN players p ON p.id = sc.player_id
      LEFT JOIN (
        SELECT player_id,
          COUNT(*) FILTER (WHERE played_at::date = CURRENT_DATE)::int AS plays_today,
          COUNT(*) FILTER (WHERE played_at >= date_trunc('month', NOW()))::int AS plays_month
        FROM display_events
        GROUP BY player_id
      ) de ON de.player_id = sc.player_id
      LEFT JOIN client_subscriptions cs ON cs.code = sc.code AND cs.status = 'ACTIVE'
      WHERE UPPER(ac.agency_code) = $1
      ORDER BY sc.name ASC
    `, [code])

    const clients = clientsRes.rows

    const summary = {
      total:       clients.length,
      online:      clients.filter((c: any) => c.online).length,
      offline:     clients.filter((c: any) => !c.online).length,
      revenue_mrr: clients.reduce((a: number, c: any) => a + Number(c.revenue_month || 0), 0),
      plays_today: clients.reduce((a: number, c: any) => a + Number(c.plays_today || 0), 0),
      plays_month: clients.reduce((a: number, c: any) => a + Number(c.plays_month || 0), 0),
    }

    return NextResponse.json({ agency, clients, summary })
  } catch (err) {
    console.error("[agency GET]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
