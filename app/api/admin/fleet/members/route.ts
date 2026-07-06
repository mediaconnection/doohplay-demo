import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

async function checkAuth(req: NextRequest) {
  const session = await getServerSession()
  const secret = req.nextUrl.searchParams.get("secret")
  return !!session?.user || (secret && secret === process.env.ADMIN_SECRET)
}

// POST — adiciona uma ou mais telas a um grupo administrativo
export async function POST(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  try {
    const { group_id, screen_ids } = await req.json()
    if (!group_id || !Array.isArray(screen_ids) || screen_ids.length === 0) {
      return NextResponse.json({ error: "group_id e screen_ids (array) são obrigatórios" }, { status: 400 })
    }
    const pool = getPool()
    for (const screenId of screen_ids) {
      await pool.query(
        `INSERT INTO fleet_group_members (fleet_group_id, screen_id)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [group_id, screenId]
      )
    }
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("[admin/fleet/members POST]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE — remove uma tela de um grupo (?group_id=&screen_id=)
export async function DELETE(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const groupId = req.nextUrl.searchParams.get("group_id")
  const screenId = req.nextUrl.searchParams.get("screen_id")
  if (!groupId || !screenId) return NextResponse.json({ error: "group_id e screen_id são obrigatórios" }, { status: 400 })
  const pool = getPool()
  await pool.query(
    `DELETE FROM fleet_group_members WHERE fleet_group_id = $1 AND screen_id = $2`,
    [groupId, screenId]
  )
  return NextResponse.json({ ok: true })
}
