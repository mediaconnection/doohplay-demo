import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

async function checkAuth(req: NextRequest) {
  const session = await getServerSession()
  const secret = req.nextUrl.searchParams.get("secret")
  return !!session?.user || (secret && secret === process.env.ADMIN_SECRET)
}

// POST — substitui a lista de tags de uma tela
export async function POST(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  try {
    const { screen_id, tags } = await req.json()
    if (!screen_id || !Array.isArray(tags)) {
      return NextResponse.json({ error: "screen_id e tags (array) são obrigatórios" }, { status: 400 })
    }
    const clean = tags.map((t: string) => String(t).trim().toLowerCase()).filter(Boolean)
    const pool = getPool()
    await pool.query(`UPDATE client_screens SET tags = $1 WHERE id = $2`, [clean, screen_id])
    return NextResponse.json({ ok: true, tags: clean })
  } catch (err: any) {
    console.error("[admin/fleet/tags POST]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
