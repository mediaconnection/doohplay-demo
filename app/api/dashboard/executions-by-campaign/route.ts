export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const start = req.nextUrl.searchParams.get("start")
  const end = req.nextUrl.searchParams.get("end")

  if (!start || !end) {
    return NextResponse.json({ error: "start e end são obrigatórios" }, { status: 400 })
  }

  const { pool } = await import("@/lib/db")

  try {
    const result = await pool.query(
      "SELECT * FROM dashboard_executions_by_campaign($1, $2)",
      [start, end]
    )

    return NextResponse.json(result.rows, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("DASHBOARD_EXECUTIONS_BY_CAMPAIGN_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "Erro ao buscar execuções por campanha",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
