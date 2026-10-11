// app/api/admin/media-examples/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"
import { requireAdminSession } from "../../_lib/requireAdmin"

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
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const { id } = await params
  const pool = getPool()
  try {
    const { active } = await req.json()
    const { rows } = await pool.query(
      `UPDATE media_examples SET active = $1 WHERE id = $2 AND deleted_at IS NULL RETURNING id, active`,
      [!!active, id]
    )
    if (!rows[0]) return NextResponse.json({ error: "Exemplo não encontrado" }, { status: 404 })
    return NextResponse.json({ ok: true, ...rows[0] })
  } catch (err: any) {
    console.error("[admin/media-examples/[id] PATCH]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE — EXCLUSÃO LÓGICA desde 11/10/2026 (Documento-Mestre 12.63). A
// versão de 16/07/2026 apagava o registro e o arquivo no R2. Mas o arquivo
// de um exemplo pode estar em uso: quando um cliente ativa o exemplo
// (client/media-examples/activate), a mídia dele aponta pra MESMA URL —
// apagar o arquivo deixava a playlist do cliente com 404. Agora marca
// deleted_at + active = false (some da galeria e do admin) e mantém o
// arquivo. Só admin logado — ?secret= não vale pra excluir.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession("admin/media-examples DELETE")
  if (auth.denied) return auth.denied
  const { id } = await params
  const pool = getPool()
  try {
    const { rows } = await pool.query(
      `UPDATE media_examples SET deleted_at = NOW(), active = false
       WHERE id = $1 AND deleted_at IS NULL RETURNING id, name`,
      [id]
    )
    if (!rows[0]) return NextResponse.json({ error: "Exemplo não encontrado" }, { status: 404 })

    console.log(`[admin/media-examples DELETE] "${rows[0].name}" (${id}) marcado como excluído por ${auth.email}; arquivo mantido`)
    return NextResponse.json({ ok: true, deleted: id, soft: true })
  } catch (err: any) {
    console.error("[admin/media-examples/[id] DELETE]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
