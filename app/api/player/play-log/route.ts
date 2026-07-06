import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

// POST — registra que uma mídia começou a tocar de verdade, agora, nessa
// tela. Chamado pelo player em todo showSlide() real (não em preview).
// Precisa ser leve e nunca travar o player — falha aqui só é logada,
// nunca propagada de volta como erro visível na tela.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      client_code, screen_player_id, media_id, media_name,
      media_type, slot_category, duration_seconds,
    } = body

    if (!client_code || !media_id) {
      return NextResponse.json({ error: "client_code e media_id são obrigatórios" }, { status: 400 })
    }

    const pool = getPool()
    await pool.query(
      `INSERT INTO play_log
         (client_code, screen_player_id, media_id, media_name, media_type, slot_category, duration_seconds)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        String(client_code).toUpperCase(), screen_player_id ?? null,
        String(media_id), media_name ?? null, media_type ?? null,
        slot_category ?? null, duration_seconds ?? null,
      ]
    )
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("[player/play-log POST]", err)
    // Nunca propaga erro 500 de volta pro player por causa disso —
    // registro de log não pode ser motivo de travar exibição real.
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
