// app/api/admin/network-media/[id]/route.ts
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function PATCH(req: NextRequest, context: any) {
  const session = await getServerSession()
  const body = await req.json()

  const isNextAuth = !!session?.user
  const isLegacy   = body.secret && body.secret === process.env.ADMIN_SECRET

  if (!isNextAuth && !isLegacy) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  const { status } = body

  if (!["approved", "rejected"].includes(status)) {
    return Response.json({ error: "status invalido" }, { status: 400 })
  }

  const pool = getPool()

  try {
    const { rows } = await pool.query(
      `UPDATE network_media SET status = $1 WHERE id = $2 RETURNING id, owner_code`,
      [status, id]
    )
    const media = rows[0]
    if (!media) return Response.json({ error: "Mídia não encontrada" }, { status: 404 })

    // Etapa 2, Fase 2 (2026-09-08): removida a distribuição automática pra
    // todos os parceiros aceitos quando a mídia é aprovada. Esta rota
    // continua sendo o gate de qualidade/brand-safety da DOOHPLAY (a peça
    // só pode ser pedida por um parceiro depois de `status = 'approved'`
    // aqui) — mas quem decide PRA QUEM ela vai é o próprio dono, pedido por
    // pedido, em POST /api/client/network-partnerships/[code]/request,
    // aprovado pelo parceiro que vai exibir, não broadcast automático.

    return Response.json({ ok: true })
  } catch (err) {
    console.error("[admin network-media PATCH]", err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
