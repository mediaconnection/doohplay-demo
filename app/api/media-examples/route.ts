// app/api/media-examples/route.ts
// Lista exemplos de mídia ativos por nicho — usada na tela de onboarding
// pra cliente novo sem conteúdo próprio ainda poder ativar algo no dia 1.
// Sempre inclui também os exemplos 'generico', além do nicho pedido.
// (Nomenclatura: "template" fica reservado para telas divididas em partes
// — hora, vídeo, publicidade etc. Isto aqui é mídia de exemplo/genérica.)
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const pool = getPool()
  const niche = (req.nextUrl.searchParams.get("niche") || "generico").toLowerCase()

  try {
    const { rows } = await pool.query(
      `SELECT id, niche, name, type, url, duration
       FROM media_examples
       WHERE active = true AND niche IN ($1, 'generico')
       ORDER BY niche = 'generico' ASC, created_at DESC`,
      [niche]
    )
    return NextResponse.json({ niche, count: rows.length, examples: rows })
  } catch (err: any) {
    console.error("[media-examples GET]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
