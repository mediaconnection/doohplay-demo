export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server"

export async function GET() {
    const { pool } = await import("@/lib/db")


  const stats = await pool.query(`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24h') as last_24h
    FROM proof_certificates
  `)

  const recent = await pool.query(`
    SELECT hash, created_at
    FROM proof_certificates
    ORDER BY created_at DESC
    LIMIT 10
  `)

  return NextResponse.json({
    total: Number(stats.rows[0].total),
    last24h: Number(stats.rows[0].last_24h),
    recent: recent.rows
  })
}

