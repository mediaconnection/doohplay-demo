import { getPool } from "@/lib/db"

export async function GET() {
  const pool = getPool()

  const fmt = (d?: string | null) => {
    if (!d) return "—"
    try {
      return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo"
      }).format(new Date(d))
    } catch { return "—" }
  }

  try {
    const blocksRes = await pool.query(`
      SELECT id, merkle_root, block_hash, tx_hash, anchored_at, created_at
      FROM event_blocks
      ORDER BY created_at DESC LIMIT 5
    `)

    const blocks = blocksRes.rows.map(b => ({
      id: b.id,
      hash: b.block_hash ? `${b.block_hash.slice(0,10)}...${b.block_hash.slice(-4)}` : "—",
      merkle: b.merkle_root ? `${b.merkle_root.slice(0,10)}...${b.merkle_root.slice(-4)}` : "—",
      txs: 0,
      time: fmt(b.created_at),
      status: b.anchored_at ? "Ancorado" : "Processando",
    }))

    const eventsRes = await pool.query(`
      SELECT e.id::text, e.event_hash, e.screen_id::text, e.played_at,
             s.name AS screen_label,
             (e.event_hash IS NOT NULL)::boolean AS anchored
      FROM display_events e
      LEFT JOIN screens s ON s.id = e.screen_id
      ORDER BY e.played_at DESC LIMIT 5
    `)

    const events = eventsRes.rows.map(e => ({
      id: e.id,
      hash: e.event_hash ? `${e.event_hash.slice(0,10)}...${e.event_hash.slice(-4)}` : "—",
      screen: e.screen_label ?? "—",
      campaign: "Exibição",
      time: fmt(e.played_at),
      status: e.anchored ? "Verified" : "Pending",
    }))

    const statsRes = await pool.query(`
      SELECT COUNT(*)::int AS total_blocks,
             (SELECT COUNT(*)::int FROM display_events) AS total_events,
             (SELECT merkle_root FROM event_blocks ORDER BY created_at DESC LIMIT 1) AS latest_merkle,
             (SELECT COALESCE(tx_hash, blockchain_tx) FROM event_blocks
              WHERE tx_hash IS NOT NULL OR blockchain_tx IS NOT NULL
              ORDER BY created_at DESC LIMIT 1) AS latest_tx
      FROM event_blocks
    `)

    return Response.json({ blocks, events, stats: statsRes.rows[0] ?? {} })
  } catch (err) {
    console.error("[explorer data]", err)
    return Response.json({ blocks: [], events: [], stats: {}, error: String(err) })
  }
}
