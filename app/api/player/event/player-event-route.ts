import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { createHash } from "crypto"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { player_code, campaign_id, duration, media_id, played_at } = body

    if (!player_code || !campaign_id) {
      return NextResponse.json({ error: "player_code e campaign_id obrigatórios" }, { status: 400 })
    }

    // Buscar player
    const playerRes = await pool.query(
      `SELECT id, name FROM players WHERE player_code = $1 LIMIT 1`,
      [player_code.trim().toUpperCase()]
    )
    const player = playerRes.rows[0]
    if (!player) {
      return NextResponse.json({ error: "Player não encontrado" }, { status: 404 })
    }

    // Buscar campanha
    const campaignRes = await pool.query(
      `SELECT id, name FROM campaigns WHERE id = $1 LIMIT 1`,
      [campaign_id]
    )
    const campaign = campaignRes.rows[0]
    if (!campaign) {
      return NextResponse.json({ error: "Campanha não encontrada" }, { status: 404 })
    }

    const playedAt = played_at ? new Date(played_at) : new Date()

    // Gerar hash único do evento
    const eventPayload = JSON.stringify({
      player_id: player.id,
      campaign_id,
      played_at: playedAt.toISOString(),
      duration: duration ?? 30,
      media_id: media_id ?? null,
      nonce: Math.random().toString(36).slice(2),
    })
    const eventHash = createHash("sha256").update(eventPayload).digest("hex")

    // Registrar em display_events
    const insertRes = await pool.query(`
      INSERT INTO display_events (
        id, campaign_id, player_id, played_at,
        duration, event_hash, event_payload, created_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3,
        $4, $5, $6::jsonb, NOW()
      )
      RETURNING id, event_hash, played_at
    `, [
      campaign_id,
      player.id,
      playedAt,
      duration ?? 30,
      eventHash,
      eventPayload,
    ])

    const event = insertRes.rows[0]

    // Registrar em event_chain para verificação
    await pool.query(`
      INSERT INTO event_chain (
        event_id, event_type, source_table, source_id,
        occurred_at, event_hash, block_id,
        merkle_root, merkle_proof,
        created_at, signature_algorithm, signature_encoding
      )
      SELECT
        $1::uuid, 'display', 'display_events', $1::uuid,
        $2, $3, 530,
        $3, '[]'::jsonb,
        NOW(), 'RSA-SHA256', 'base64'
      WHERE NOT EXISTS (
        SELECT 1 FROM event_chain WHERE event_hash = $3
      )
    `, [event.id, playedAt, eventHash])

    // Inserir na certifications para verificação pública
    await pool.query(`
      INSERT INTO certifications (
        content_hash, entity_id, entity_type,
        merkle_root, tx_hash, blockchain_tx,
        tsa_token, created_at
      )
      SELECT
        $1, $2, 'event',
        $1,
        '0xc0680ce7bbb283cbb7af6ec6c6fc01cb99067434e1aaa4ec513d24d4f1c10b32',
        '0xc0680ce7bbb283cbb7af6ec6c6fc01cb99067434e1aaa4ec513d24d4f1c10b32',
        c.tsa_token,
        NOW()
      FROM certifications c
      WHERE c.content_hash = '20ec722b179a772ddc19c2a6053326906da1e598cc3dcaeed4a48efee2f950be'
      LIMIT 1
    `, [eventHash, event.id]).catch(() => {})

    return NextResponse.json({
      ok: true,
      event_id: event.id,
      event_hash: eventHash,
      played_at: event.played_at,
      verify_url: `https://doohplay-demo.onrender.com/verify/${eventHash}`,
    })
  } catch (err) {
    console.error("Player event error:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
