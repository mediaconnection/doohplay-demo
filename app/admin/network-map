// app/api/admin/network-map/route.ts
import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const pool = getPool()
  try {
    const { rows } = await pool.query(`
      SELECT
        p.id::text,
        p.name,
        p.location,
        p.latitude,
        p.longitude,
        p.is_active,
        p.last_ping::text,
        p.platform,
        p.device_type,
        p.paired,
        sc.name   AS client_name,
        sc.code   AS client_code,
        CASE
          WHEN p.last_ping > NOW() - INTERVAL '3 minutes' THEN 'online'
          WHEN p.last_ping > NOW() - INTERVAL '1 hour'   THEN 'idle'
          ELSE 'offline'
        END AS status
      FROM players p
      LEFT JOIN studio_clients sc ON sc.player_id = p.id
      WHERE p.latitude IS NOT NULL AND p.longitude IS NOT NULL
      ORDER BY p.is_active DESC, p.last_ping DESC
    `)

    const summary = {
      total:   rows.length,
      online:  rows.filter(r => r.status === "online").length,
      idle:    rows.filter(r => r.status === "idle").length,
      offline: rows.filter(r => r.status === "offline").length,
    }

    return NextResponse.json({ players: rows, summary })
  } catch (err) {
    console.error("[network-map]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
