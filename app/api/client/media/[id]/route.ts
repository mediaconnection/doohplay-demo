// app/api/client/media/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const pool = getPool()
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json({ error: "Código do cliente é obrigatório" }, { status: 400 })
    }

    // Confirma que a mídia pertence a uma campanha do cliente (segurança)
    const { rows: check } = await pool.query(`
      SELECT cm.id FROM "CampaignMedia" cm
      JOIN "Campaign" c ON c.id = cm."campaignId"
      WHERE cm.id = $1 AND c."advertiserCode" = $2
    `, [id, code.toUpperCase()])

    if (!check[0]) {
      return NextResponse.json({ error: "Mídia não encontrada ou não pertence a este cliente" }, { status: 404 })
    }

    // Remove agendamento de playlist (se existir)
    await pool.query(`DELETE FROM playlist_schedule WHERE media_id = $1 AND client_code = $2`, [id, code.toUpperCase()])

    // Remove a mídia
    await pool.query(`DELETE FROM "CampaignMedia" WHERE id = $1`, [id])

    return NextResponse.json({ ok: true })

  } catch (err: any) {
    console.error("[media DELETE]", err)
    return NextResponse.json({ error: err.message ?? "Erro interno" }, { status: 500 })
  }
}
