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

    // Ao aprovar: distribui pra todos os parceiros já aceitos deste dono —
    // mesma lógica de quando uma parceria nova é aceita, só que aqui é a
    // mídia que chegou depois que as parcerias já existiam.
    if (status === "approved") {
      await pool.query(
        `
        INSERT INTO network_media_distribution (network_media_id, displayed_on_code, active, added_at)
        SELECT $1, partner_code, true, now()
        FROM (
          SELECT CASE WHEN requester_code = $2 THEN partner_code ELSE requester_code END AS partner_code
          FROM network_partnerships
          WHERE status = 'accepted' AND (requester_code = $2 OR partner_code = $2)
        ) partners
        ON CONFLICT (network_media_id, displayed_on_code) DO UPDATE SET active = true
        `,
        [media.id, media.owner_code]
      )
    }

    // Ao rejeitar: desativa qualquer distribuição que já tivesse sido feita
    // (relevante se a mídia foi aprovada antes e depois rejeitada de novo).
    if (status === "rejected") {
      await pool.query(
        `UPDATE network_media_distribution SET active = false WHERE network_media_id = $1`,
        [media.id]
      )
    }

    return Response.json({ ok: true })
  } catch (err) {
    console.error("[admin network-media PATCH]", err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
