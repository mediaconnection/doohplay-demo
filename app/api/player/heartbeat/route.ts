import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"

export const dynamic = "force-dynamic"

function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { screen_id } = body

    if (!screen_id) return NextResponse.json({ ok: true }) // silently ignore

    // Só atualiza se for UUID válido
    if (!isUUID(screen_id)) {
      return NextResponse.json({ ok: true })
    }

    // Tenta atualizar last_seen na tabela players/screens
    try {
      await pool.query(
        `UPDATE players SET last_ping = NOW() WHERE id = $1`,
        [screen_id]
      )
    } catch {
      // Tabela pode não ter last_seen — ignora silenciosamente
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("HEARTBEAT_ROUTE_ERROR", err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
