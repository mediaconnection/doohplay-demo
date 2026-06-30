// app/api/client/screens/[code]/route.ts
// Lista as telas físicas (client_screens) de um cliente, com status real de
// cada uma. Hoje a maioria dos clientes tem só 1 tela — essa rota funciona
// igual nesse caso (lista com 1 item), sem exigir UI condicional separada.
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const pool = getPool()
  try {
    const { rows } = await pool.query(
      `SELECT
         cs.id, cs.label, cs.same_content, cs.group_id, cs.group_position, cs.group_total,
         p.id AS player_id, p.device_type, p.platform, p.last_ping,
         CASE
           WHEN p.last_ping > NOW() - INTERVAL '3 minutes' THEN true
           ELSE false
         END AS online
       FROM client_screens cs
       JOIN players p ON p.id = cs.player_id
       WHERE cs.client_code = $1
       ORDER BY cs.created_at ASC`,
      [code.toUpperCase()]
    )
    return NextResponse.json({ screens: rows })
  } catch (err) {
    console.error("[client/screens GET]", err)
    return NextResponse.json({ screens: [], error: String(err) }, { status: 500 })
  }
}
