// app/api/admin/players/link/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

// GET — lista dispositivos aguardando pareamento (paired = false), pra
// admin escolher qual vincular a qual cliente, sem precisar de SQL manual.
export async function GET(req: NextRequest) {
  const session = await getServerSession()
  const secret = req.nextUrl.searchParams.get("secret")
  if (!session?.user && !(secret && secret === process.env.ADMIN_SECRET)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const pool = getPool()
  const pending = await pool.query(
    `SELECT p.id, p.device_type, p.platform, p.created_at
     FROM players p
     WHERE (p.paired = false OR p.paired IS NULL)
       AND p.tenant_id IS NULL
       AND p.id NOT IN (SELECT player_id FROM studio_clients WHERE player_id IS NOT NULL)
       AND p.device_fingerprint IS NOT NULL
     ORDER BY p.created_at DESC
     LIMIT 50`
  )
  return NextResponse.json({ pending: pending.rows })
}

// POST — vincula um player_id (já ativado, ainda não pareado) a um código
// de cliente real (studio_clients.code). Atualiza os dois lados:
// players.paired/player_code e studio_clients.player_id.
export async function POST(req: NextRequest) {
  const session = await getServerSession()
  const body = await req.json()
  const secret = body.secret
  if (!session?.user && !(secret && secret === process.env.ADMIN_SECRET)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { player_id, code } = body
  if (!player_id || !code) {
    return NextResponse.json({ error: "player_id e code são obrigatórios" }, { status: 400 })
  }

  const pool = getPool()
  try {
    const client = await pool.query(
      `SELECT code, name FROM studio_clients WHERE UPPER(code) = UPPER($1) LIMIT 1`,
      [code]
    )
    if (!client.rows[0]) {
      return NextResponse.json({ error: "Código de cliente não encontrado" }, { status: 404 })
    }

    await pool.query(
      `UPDATE players SET paired = true, paired_at = NOW(), player_code = $1 WHERE id = $2`,
      [client.rows[0].code, player_id]
    )
    await pool.query(
      `UPDATE studio_clients SET player_id = $1 WHERE code = $2`,
      [player_id, client.rows[0].code]
    )

    return NextResponse.json({ ok: true, code: client.rows[0].code, name: client.rows[0].name })
  } catch (err: any) {
    console.error("[admin/players/link POST]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
