// app/api/client/trial/[code]/route.ts
// Retorna informações sobre o período de trial do cliente

import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const pool = getPool()
  try {
    const { code } = await params

    const { rows } = await pool.query(`
      SELECT
        fs.status,
        fs.plan,
        fs.value,
        fs.created_at,
        EXTRACT(DAY FROM (NOW() - fs.created_at)) as days_since_created,
        7 - EXTRACT(DAY FROM (NOW() - fs.created_at)) as days_left
      FROM financial_subscriptions fs
      WHERE fs.code = UPPER($1)
      LIMIT 1
    `, [code])

    if (!rows[0]) {
      return NextResponse.json({ trial: false, subscription: null })
    }

    const daysLeft = Math.max(0, Math.ceil(Number(rows[0].days_left)))
    const inTrial = Number(rows[0].days_since_created) < 7

    return NextResponse.json({
      trial: inTrial,
      days_left: daysLeft,
      plan: rows[0].plan,
      value: rows[0].value,
      status: rows[0].status,
    })

  } catch (err: any) {
    console.error("[trial]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
