import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

async function checkAuth(req: NextRequest) {
  const session = await getServerSession()
  const secret = req.nextUrl.searchParams.get("secret")
  return !!session?.user || (secret && secret === process.env.ADMIN_SECRET)
}

// GET — últimos registros de play_log, pra conferir que o proof-of-play
// real está funcionando (não precisa esperar um relatório formal pra saber
// se está gravando).
export async function GET(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const clientCode = req.nextUrl.searchParams.get("client_code")
  const pool = getPool()
  const { rows } = await pool.query(
    clientCode
      ? `SELECT * FROM play_log WHERE client_code = $1 ORDER BY started_at DESC LIMIT 50`
      : `SELECT * FROM play_log ORDER BY started_at DESC LIMIT 50`,
    clientCode ? [clientCode.toUpperCase()] : []
  )
  const totalRes = await pool.query(`SELECT COUNT(*)::int AS total FROM play_log`)
  return NextResponse.json({ total_geral: totalRes.rows[0].total, items: rows })
}
