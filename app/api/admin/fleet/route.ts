import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

async function checkAuth(req: NextRequest) {
  const session = await getServerSession()
  const secret = req.nextUrl.searchParams.get("secret")
  return !!session?.user || (secret && secret === process.env.ADMIN_SECRET)
}

// GET — lista todas as telas de todos os clientes, com status online/offline
// real (heartbeat), tags e grupos administrativos. É a visão "rede inteira"
// que não existia antes — hoje só dava pra ver tela por tela, cliente por
// cliente.
export async function GET(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const pool = getPool()

  const { rows: screens } = await pool.query(`
    SELECT
      cs.id, cs.client_code, cs.label, cs.tags, cs.created_at,
      sc.name AS client_name,
      p.last_ping,
      (p.last_ping IS NOT NULL AND p.last_ping > NOW() - INTERVAL '3 minutes') AS online
    FROM client_screens cs
    JOIN studio_clients sc ON sc.code = cs.client_code
    LEFT JOIN players p ON p.id = cs.player_id
    ORDER BY sc.name, cs.label
  `)

  const { rows: groups } = await pool.query(`
    SELECT fg.id, fg.name, fg.created_at,
           COALESCE(array_agg(fgm.screen_id) FILTER (WHERE fgm.screen_id IS NOT NULL), '{}') AS screen_ids
    FROM fleet_groups fg
    LEFT JOIN fleet_group_members fgm ON fgm.fleet_group_id = fg.id
    GROUP BY fg.id, fg.name, fg.created_at
    ORDER BY fg.created_at DESC
  `)

  return NextResponse.json({ screens, groups })
}

// POST — cria um grupo administrativo novo
export async function POST(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  try {
    const { name } = await req.json()
    if (!name?.trim()) return NextResponse.json({ error: "Nome do grupo é obrigatório" }, { status: 400 })
    const pool = getPool()
    const { rows } = await pool.query(
      `INSERT INTO fleet_groups (name) VALUES ($1) RETURNING id, name, created_at`,
      [name.trim()]
    )
    return NextResponse.json({ ok: true, group: rows[0] })
  } catch (err: any) {
    console.error("[admin/fleet POST]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE — remove um grupo administrativo (?group_id=)
export async function DELETE(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const groupId = req.nextUrl.searchParams.get("group_id")
  if (!groupId) return NextResponse.json({ error: "group_id é obrigatório" }, { status: 400 })
  const pool = getPool()
  await pool.query(`DELETE FROM fleet_groups WHERE id = $1`, [groupId])
  return NextResponse.json({ ok: true })
}
