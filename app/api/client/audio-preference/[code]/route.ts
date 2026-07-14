/**
 * app/api/client/audio-preference/[code]/route.ts
 *
 * Fase 20 (14/07/2026): liga/desliga áudio nos vídeos e no YouTube
 * institucional, por CLIENTE (não por tela física — ver comentário na
 * migração phase20_step1_audio_toggle.sql sobre o motivo). Desligado
 * (mudo) é o padrão de sempre; isso só existe pra quem pedir explicitamente.
 *
 * GET  /api/client/audio-preference/BARBE332  → { audioEnabled: boolean }
 * PATCH com { audio_enabled: boolean }         → salva a preferência
 */
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { verifyClientSessionToken, CLIENT_SESSION_COOKIE } from "@/lib/client-session"

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const upperCode = code.toUpperCase()
  const pool = getPool()
  try {
    const { rows } = await pool.query(
      `SELECT audio_enabled FROM studio_clients WHERE UPPER(code) = $1 LIMIT 1`,
      [upperCode]
    )
    return NextResponse.json({ audioEnabled: rows[0]?.audio_enabled ?? false })
  } catch (err) {
    console.error("[audio-preference GET]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const upperCode = code.toUpperCase()

  const sessionCode = verifyClientSessionToken(req.cookies.get(CLIENT_SESSION_COOKIE)?.value)
  if (sessionCode !== upperCode) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const pool = getPool()
  try {
    const { audio_enabled } = await req.json()
    if (typeof audio_enabled !== "boolean") {
      return NextResponse.json({ error: "audio_enabled precisa ser true/false" }, { status: 400 })
    }
    await pool.query(
      `UPDATE studio_clients SET audio_enabled = $1 WHERE UPPER(code) = $2`,
      [audio_enabled, upperCode]
    )
    return NextResponse.json({ ok: true, audioEnabled: audio_enabled })
  } catch (err) {
    console.error("[audio-preference PATCH]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
