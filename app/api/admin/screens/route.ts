// app/api/admin/screens/route.ts
// Visão consolidada de TODAS as telas físicas (client_screens) de TODOS os
// clientes, pro admin gerenciar sem precisar de SQL manual. Útil sobretudo
// quando houver mais de 1 cliente com múltiplas telas.
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const session = await getServerSession()
  const secret = req.nextUrl.searchParams.get("secret")
  if (!session?.user && !(secret && secret === process.env.ADMIN_SECRET)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const pool = getPool()
  try {
    const { rows } = await pool.query(`
      SELECT
        cs.id, cs.client_code, sc.name AS client_name,
        cs.label, cs.same_content, cs.group_id,
        p.id AS player_id, p.device_type, p.platform, p.last_ping,
        CASE WHEN p.last_ping > NOW() - INTERVAL '3 minutes' THEN true ELSE false END AS online,
        (COALESCE(up.days_total, 0) >= 14 AND COALESCE(up.days_present, 0)::float / NULLIF(up.days_total, 0) >= 0.9) AS verified
      FROM client_screens cs
      JOIN studio_clients sc ON sc.code = cs.client_code
      JOIN players p ON p.id = cs.player_id
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS days_present, (CURRENT_DATE - MIN(day) + 1) AS days_total
        FROM player_uptime_daily
        WHERE player_id = p.id AND day > CURRENT_DATE - INTERVAL '30 days'
      ) up ON true
      ORDER BY sc.name ASC, cs.created_at ASC
    `)
    // Fase 37 (20/07/2026): mesmo motivo da lista de pendentes — o código
    // de ativação (o que aparece na TV) ajuda a confirmar visualmente
    // qual linha da lista é qual aparelho físico, sem precisar adivinhar
    // só pelo nome do dispositivo (que pode repetir, ex: dois "rockchip
    // RPCplus" de clientes diferentes).
    const withCode = rows.map((r: any) => ({
      ...r,
      activation_code: `DHP-${String(r.player_id).replace(/-/g, "").slice(0, 6).toUpperCase()}`,
    }))
    return NextResponse.json({ screens: withCode })
  } catch (err) {
    console.error("[admin/screens GET]", err)
    return NextResponse.json({ screens: [], error: String(err) }, { status: 500 })
  }
}
