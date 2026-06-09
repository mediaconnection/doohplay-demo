import { getPool } from "@/lib/db"

export async function GET() {
  const pool = getPool()

  try {
    const [blocksRes, eventsRes, statsRes, totalEventsRes] = await Promise.all([
      pool.query(`
        SELECT b.id, b.merkle_root, b.block_hash, b.tx_hash, b.blockchain_tx,
               b.anchored_at, b.created_at,
               COALESCE((SELECT COUNT(*)::int FROM display_events e WHERE e.merkle_batch_id = b.id), 0) AS event_count
        FROM event_blocks b
        ORDER BY b.created_at DESC LIMIT 5
      `),
      pool.query(`
        SELECT e.id::text, e.event_hash, e.screen_id::text, e.played_at,
               s.name AS screen_label,
               (e.event_hash IS NOT NULL)::boolean AS anchored
        FROM display_events e
        LEFT JOIN screens s ON s.id = e.screen_id
        ORDER BY e.played_at DESC LIMIT 5
      `),
      pool.query(`
        SELECT COUNT(*)::int AS total_blocks,
               MAX(created_at)::text AS latest_block,
               (SELECT merkle_root FROM event_blocks ORDER BY created_at DESC LIMIT 1) AS latest_merkle,
               (SELECT COALESCE(tx_hash, blockchain_tx) FROM event_blocks WHERE (tx_hash IS NOT NULL OR blockchain_tx IS NOT NULL) ORDER BY created_at DESC LIMIT 1) AS latest_tx
        FROM event_blocks
      `),
      pool.query(`SELECT COUNT(*)::int AS total_events FROM display_events`),
    ])

    const fmt = (d?: string | null) => {
      if (!d) return "—"
      try {
        return new Intl.DateTimeFormat("pt-BR", {
          dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo"
        }).format(new Date(d))
      } catch { return "—" }
    }

    const blocks = blocksRes.rows.map(b => ({
      id: b.id,
      hash: b.block_hash ? `${b.block_hash.slice(0,10)}...${b.block_hash.slice(-4)}` : "—",
      merkle: b.merkle_root ? `${b.merkle_root.slice(0,10)}...${b.merkle_root.slice(-4)}` : "—",
      txs: b.event_count,
      time: fmt(b.created_at),
      status: b.anchored_at ? "Ancorado" : "Processando",
    }))

    const events = eventsRes.rows.map(e => ({
      id: e.id,
      hash: e.event_hash ? `${e.event_hash.slice(0,10)}...${e.event_hash.slice(-4)}` : "—",
      screen: e.screen_label ?? e.screen_id ?? "—",
      campaign: "Exibição",
      time: fmt(e.played_at),
      status: e.anchored ? "Verified" : "Pending",
    }))

    const stats = {
      ...(statsRes.rows[0] ?? {}),
      total_events: totalEventsRes.rows[0]?.total_events ?? 0,
    }

    return Response.json({ blocks, events, stats })
  } catch (err) {
    console.error("[explorer data]", err)
    return Response.json({ blocks: [], events: [], stats: {}, error: String(err) })
  }
}
