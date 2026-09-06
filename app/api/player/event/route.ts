// app/api/player/event/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { randomUUID, createHash } from "crypto"
import { appendEventToLedger } from "@proof-engine/domain/ledger/appendEvent"

export const dynamic = "force-dynamic"

// Achado em produção (16/07/2026): o motor de ProofChain (Merkle tree, TSA,
// ancoragem real na Polygon — tudo já implementado em lib/proof/ e
// lib/blockchain/anchor.ts) nunca recebia dado real, porque lia de
// `event_chain`, e o player de verdade só gravava em `display_events`
// (tabelas e rotas diferentes, nunca ligadas). Aqui é o ponto de conexão:
// mantém a gravação em display_events exatamente como estava, e agora TAMBÉM
// grava em event_chain.
//
// Etapa 2 da separação de fronts (2026-09-06): esta rota reimplementava a
// gravação em event_chain localmente (própria fórmula de hash), duplicando
// packages/proof-engine/domain/ledger/appendEvent.ts::appendEventToLedger — a mesma classe de
// risco do incidente de 25/06/2026 (lógica duplicada divergindo em
// silêncio), só que desta vez dentro do próprio ledger de prova. Trocado
// pra reusar a função canônica, já usada por lib/adserver/registerImpression.ts.
// Seguro trocar a fórmula de hash no meio da cadeia: packages/proof-engine/domain/ledger/
// verifyChain.ts só segue ponteiros (previous_event_hash), nunca recalcula
// hash a partir do payload.
async function appendToProofChain(payload: Record<string, any>) {
  try {
    const payloadHash = createHash("sha256").update(JSON.stringify(payload)).digest("hex")
    await appendEventToLedger({ event_id: randomUUID(), hash: payloadHash, payload })
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
    await appendToProofChain({
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
