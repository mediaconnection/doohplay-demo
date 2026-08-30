export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export const runtime = "nodejs"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { pool } = await import("@/lib/db")

  try {
    const result = await pool.query(
      `
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE last_ping > NOW() - INTERVAL '5 minutes')::int AS online,
        COUNT(*) FILTER (WHERE last_ping IS NULL OR last_ping <= NOW() - INTERVAL '5 minutes')::int AS offline
      FROM public.players
      `
    )

    const row = result.rows[0] ?? { total: 0, online: 0, offline: 0 }
    const total = Number(row.total ?? 0)
    const online = Number(row.online ?? 0)
    const offline = Number(row.offline ?? 0)
    const percentageOnline = total > 0 ? Number(((online / total) * 100).toFixed(2)) : 0

    return NextResponse.json(
      {
        total,
        online,
        offline,
        percentageOnline,
        checkedAt: new Date().toISOString()
      },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (error) {
    console.error("PLAYERS_STATUS_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "Erro ao buscar status dos players",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
