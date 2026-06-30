// app/api/admin/institutional-media/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

async function checkAuth(req: NextRequest) {
  const session = await getServerSession()
  const secret = req.nextUrl.searchParams.get("secret")
  return !!session?.user || (secret && secret === process.env.ADMIN_SECRET)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const { id } = await params
  const pool = getPool()
  try {
    const { active } = await req.json()
    const { rows } = await pool.query(
      `UPDATE institutional_media SET active = $1 WHERE id = $2 RETURNING id, active`,
      [!!active, id]
    )
    if (!rows[0]) return NextResponse.json({ error: "Item não encontrado" }, { status: 404 })
    return NextResponse.json({ ok: true, ...rows[0] })
  } catch (err: any) {
    console.error("[admin/institutional-media/[id] PATCH]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const { id } = await params
  const pool = getPool()
  try {
    const { rows } = await pool.query(
      `DELETE FROM institutional_media WHERE id = $1 RETURNING id`,
      [id]
    )
    if (!rows[0]) return NextResponse.json({ error: "Item não encontrado" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("[admin/institutional-media/[id] DELETE]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
