// app/api/admin/screens/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

async function checkAuth(req: NextRequest, body?: any) {
  const session = await getServerSession()
  const secret = req.nextUrl.searchParams.get("secret") ?? body?.secret
  return !!session?.user || (secret && secret === process.env.ADMIN_SECRET)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  if (!(await checkAuth(req, body))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const pool = getPool()
  try {
    const { rows } = await pool.query(
      `UPDATE client_screens
       SET label = COALESCE($1, label), same_content = COALESCE($2, same_content)
       WHERE id = $3
       RETURNING id, label, same_content`,
      [body.label ?? null, body.same_content ?? null, id]
    )
    if (!rows[0]) return NextResponse.json({ error: "Tela não encontrada" }, { status: 404 })
    return NextResponse.json({ ok: true, ...rows[0] })
  } catch (err) {
    console.error("[admin/screens/[id] PATCH]", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// Desvincula a tela (decomissionada/trocada de cliente) — NÃO apaga o
// player nem o histórico de heartbeat/proof-of-play, só remove o vínculo
// de "tela física deste cliente". Se o aparelho for pareado de novo no
// futuro (mesmo ou outro cliente), passa por /api/player/activate normal.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const pool = getPool()
  try {
    const { rows } = await pool.query(
      `DELETE FROM client_screens WHERE id = $1 RETURNING client_code, label`,
      [id]
    )
    if (!rows[0]) return NextResponse.json({ error: "Tela não encontrada" }, { status: 404 })
    // Limpa qualquer atribuição de mídia que apontava pra essa tela, pra
    // não deixar referência órfã em playlist_schedule.
    await pool.query(`UPDATE playlist_schedule SET screen_id = NULL WHERE screen_id = $1`, [id])
    return NextResponse.json({ ok: true, removed: rows[0] })
  } catch (err) {
    console.error("[admin/screens/[id] DELETE]", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
