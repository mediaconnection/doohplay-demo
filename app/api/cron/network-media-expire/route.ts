// app/api/cron/network-media-expire/route.ts
//
// Etapa 2, Fase 4 (2026-09-08) — Clube de Telas v2. Desativa
// automaticamente distribuições de peças institucionais que passaram dos
// 30 dias de validade sem extensão (spec v2, seção 1 — "peça publicada
// válida por 30 dias, extensível com nova aprovação"). Sem efeito de
// notificação — só desliga `active`, mesmo padrão de "melhor esforço,
// silencioso" já usado em `network_media_distribution` nas fases
// anteriores.
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

const CRON_SECRET = process.env.CRON_SECRET!

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret")
  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const pool = getPool()

  try {
    const { rows } = await pool.query(
      `
      UPDATE network_media_distribution
      SET active = false
      WHERE active = true
        AND extended = false
        AND expires_at IS NOT NULL
        AND expires_at < now()
      RETURNING id, network_media_id, displayed_on_code, expires_at
      `
    )

    console.log(`[network-media-expire] ${rows.length} distribuição(ões) expirada(s)`)

    return NextResponse.json({
      ok: true,
      expired: rows.length,
      results: rows,
      ts: new Date().toISOString(),
    })
  } catch (err) {
    console.error("[network-media-expire]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
