import { getPool } from "@/lib/db"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim()
  if (!q || q.length < 3) {
    return Response.json({ results: [] })
  }

  const pool = getPool()
  const results: any[] = []

  try {
    // Busca em event_blocks por block_hash, tx_hash, merkle_root ou id
    const blockRes = await pool.query(`
      SELECT id, block_hash, merkle_root, tx_hash, blockchain_tx, anchored_at, created_at,
        COALESCE((SELECT COUNT(*)::int FROM display_events e WHERE e.block_id = id), 0) AS event_count
      FROM event_blocks
      WHERE block_hash ILIKE $1
         OR merkle_root ILIKE $1
         OR tx_hash ILIKE $1
         OR blockchain_tx ILIKE $1
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
        meta: `${b.event_count} eventos`,
      })
    }

    // Busca em display_events por event_hash ou player_id
    const eventRes = await pool.query(`
      SELECT e.id::text, e.event_hash, e.player_id::text, e.played_at,
             p.name AS screen_label,
             (e.event_hash IS NOT NULL)::boolean AS anchored
      FROM display_events e
      LEFT JOIN studio_clients p ON p.player_id = e.player_id
      WHERE e.event_hash ILIKE $1
         OR e.player_id::text ILIKE $1
         OR p.name ILIKE $1
         OR e.id::text = $2
      ORDER BY e.played_at DESC
      LIMIT 5
    `, [`%${q}%`, q])

    for (const e of eventRes.rows) {
      results.push({
        type: "event",
        id: e.id,
        title: `Evento ${e.screen_label ?? e.player_id ?? e.id}`,
        sub: e.event_hash ?? e.id,
        status: e.anchored ? "Verified" : "Pending",
        href: `/explorer/event/${e.id}`,
        meta: e.played_at ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(e.played_at)) : "—",
      })
    }

    // Busca em studio_clients por nome, player_id ou code
    const screenRes = await pool.query(`
      SELECT id::text, name, player_id::text, code
      FROM studio_clients
      WHERE name ILIKE $1
         OR player_id::text ILIKE $1
         OR code ILIKE $1
      LIMIT 5
    `, [`%${q}%`])

    for (const s of screenRes.rows) {
      results.push({
        type: "screen",
        id: s.id,
        title: s.name ?? `Screen ${s.player_id}`,
        sub: `ID: ${s.player_id} · Código: ${s.code ?? "—"}`,
        status: "Ativo",
        href: `/explorer/event/${s.player_id}`,
        meta: s.code ?? "",
      })
    }

  } catch (err) {
    console.error("[explorer search]", err)
  }

  return Response.json({ results, query: q })
}
