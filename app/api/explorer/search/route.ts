import { getPool } from "@/lib/db"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim()
  if (!q || q.length < 3) return Response.json({ results: [] })

  const pool = getPool()
  const results: any[] = []

  const fmt = (d: string) => {
    try {
      return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo"
      }).format(new Date(d))
    } catch { return "—" }
  }

  try {
    // Busca em event_blocks
    const blockRes = await pool.query(`
      SELECT id, block_hash, merkle_root, tx_hash, anchored_at
      FROM event_blocks
      WHERE block_hash ILIKE $1
         OR merkle_root ILIKE $1
         OR tx_hash ILIKE $1
         OR id::text = $2
      LIMIT 5
    `, [`%${q}%`, q])

    for (const b of blockRes.rows) {
      results.push({
        type: "block",
        id: b.id,
        title: `Bloco #${b.id}`,
        sub: b.block_hash ?? b.merkle_root ?? "—",
        status: b.anchored_at ? "Ancorado" : "Pendente",
        href: `/explorer/block/${b.block_hash ?? b.id}`,
        meta: b.anchored_at ? "Ancorado" : "Pendente",
      })
    }

    // Busca em display_events por hash
    const eventRes = await pool.query(`
      SELECT e.id::text, e.event_hash, e.screen_id::text, e.played_at,
             s.name AS screen_label,
             (e.event_hash IS NOT NULL)::boolean AS anchored
      FROM display_events e
      LEFT JOIN screens s ON s.id = e.screen_id
      WHERE e.event_hash ILIKE $1
         OR e.id::text ILIKE $1
      ORDER BY e.played_at DESC
      LIMIT 5
    `, [`%${q}%`])

    for (const e of eventRes.rows) {
      results.push({
        type: "event",
        id: e.id,
        title: `Evento — ${e.screen_label ?? e.screen_id ?? "—"}`,
        sub: e.event_hash ?? e.id,
        status: e.anchored ? "Verified" : "Pending",
        href: `/explorer/event/${e.id}`,
        meta: e.played_at ? fmt(e.played_at) : "—",
      })
    }

    // Busca em screens por nome
    const screenRes = await pool.query(`
      SELECT id::text, name, city, state
      FROM screens
      WHERE name ILIKE $1
         OR city ILIKE $1
         OR id::text ILIKE $1
      LIMIT 5
    `, [`%${q}%`])

    for (const s of screenRes.rows) {
      results.push({
        type: "screen",
        id: s.id,
        title: s.name ?? `Screen ${s.id}`,
        sub: [s.city, s.state].filter(Boolean).join(", ") || s.id,
        status: "Ativo",
        href: `/explorer/event/${s.id}`,
        meta: s.city ?? "",
      })
    }

  } catch (err) {
    console.error("[explorer search]", err)
    return Response.json({ results: [], error: String(err) })
  }

  return Response.json({ results, query: q })
}
