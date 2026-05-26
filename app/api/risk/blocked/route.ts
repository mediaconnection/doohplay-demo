export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

// /app/api/risk/blocked/route.ts

import { NextResponse } from "next/server"

export async function GET() {
    const { pool } = await import("@/lib/db")

  try {
    const res = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.blocked_reason,
        c.blocked_at,
        cb.risk_snapshot
      FROM clients c
      LEFT JOIN client_blocks cb 
        ON cb.client_id = c.id
      WHERE c.status = 'blocked'
      ORDER BY c.blocked_at DESC
      LIMIT 50
    `)

    return NextResponse.json({
      success: true,
      data: res.rows
    })

  } catch (err) {
    console.error("BLOCKED_LIST_ERROR:", err)

    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    )
  }
}

