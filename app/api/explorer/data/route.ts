import { getPool } from "@/lib/db"

export async function GET() {
  const pool = getPool()

  try {
    const blocksRes = await pool.query(`
      SELECT id, merkle_root, block_hash, tx_hash, anchored_at, created_at
      FROM event_blocks
      ORDER BY created_at DESC LIMIT 5
    `)

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
      txs: 0,
      time: fmt(b.created_at),
      status: b.anchored_at ? "Ancorado" : "Processando",
    }))

    return Response.json({ blocks, events: [], stats: {} })
  } catch (err) {
    console.error("[explorer data]", err)
    return Response.json({ blocks: [], events: [], stats: {}, error: String(err) })
  }
}
