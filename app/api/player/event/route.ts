// app/api/player/event/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { randomUUID, createHash } from "crypto"

export const dynamic = "force-dynamic"

// Achado em produção (16/07/2026): o motor de ProofChain (Merkle tree, TSA,
// ancoragem real na Polygon — tudo já implementado em lib/proof/ e
// lib/blockchain/anchor.ts) nunca recebia dado real, porque lia de
// `event_chain`, e o player de verdade só gravava em `display_events`
// (tabelas e rotas diferentes, nunca ligadas). Aqui é o ponto de conexão:
// mantém a gravação em display_events exatamente como estava, e agora TAMBÉM
// grava em event_chain — mesmo schema que o agregador real (getUnanchoredEvents)
// já espera (prev_hash/event_hash/created_at, não o schema antigo e
// desalinhado do helper em legacy/ledger/writeEvent.ts, que usa nomes de
// coluna que não existem na tabela real e quebraria em runtime).
async function appendToProofChain(pool: any, payload: Record<string, any>) {
  try {
    const prevRes = await pool.query(
      `SELECT event_hash FROM event_chain ORDER BY id DESC LIMIT 1`
    )
    const prevHash: string | null = prevRes.rows[0]?.event_hash ?? null

    const eventId = randomUUID()
    const enriched = { ...payload, event_id: eventId, prev_hash: prevHash }
    const eventHash = createHash("sha256")
      .update(JSON.stringify(enriched))
      .digest("hex")

    await pool.query(
      `INSERT INTO event_chain (event_id, event_hash, prev_hash, payload, created_at)
       VALUES ($1::uuid, $2, $3, $4::jsonb, NOW())`,
      [eventId, eventHash, prevHash, JSON.stringify(enriched)]
    )
  } catch (err) {
    // Melhor esforço — nunca deve derrubar a gravação real de display_events,
    // que é o que a tela e o repasse de anúncio dependem de verdade hoje.
    console.error("[player/event] falha ao gravar no event_chain (seguindo mesmo assim):", err)
  }
}

export async function POST(req: NextRequest) {
  const pool = getPool()
  try {
    const { media_id, screen_code, played_at, asset_url, duration } = await req.json()
    if (!screen_code) return NextResponse.json({ error: "screen_code obrigatório" }, { status: 400 })

    // Busca player_id do cliente
    const { rows } = await pool.query(`
      SELECT player_id::text FROM studio_clients
      WHERE UPPER(code) = UPPER($1) AND player_id IS NOT NULL
      LIMIT 1
    `, [screen_code])

    if (!rows[0]?.player_id) return NextResponse.json({ ok: true, skipped: "sem player" })

    const playedAt  = played_at ?? new Date().toISOString()
    const id        = randomUUID()
    // event_hash único baseado em player + mídia + timestamp
    const eventHash = Buffer.from(`${rows[0].player_id}:${media_id ?? ""}:${playedAt}`).toString("base64")

    await pool.query(`
      INSERT INTO display_events (id, player_id, media_id, played_at, event_hash, asset_url, duration)
      VALUES ($1::uuid, $2::uuid, $3::uuid, $4::timestamptz, $5, $6, $7)
      ON CONFLICT DO NOTHING
    `, [
      id,
      rows[0].player_id,
      media_id ?? null,
      playedAt,
      eventHash,
      asset_url ?? null,
      duration ?? null,
    ])

    // Alimenta o pipeline ProofChain com o mesmo evento — melhor esforço,
    // nunca bloqueia a resposta nem derruba a gravação acima.
    await appendToProofChain(pool, {
      display_event_id: id,
      player_id: rows[0].player_id,
      screen_code: screen_code.toUpperCase(),
      media_id: media_id ?? null,
      played_at: playedAt,
      duration: duration ?? null,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[player/event]", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
