export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const { pool } = await import("@/lib/db")

  try {
    const { searchParams } = new URL(req.url)

    const campaign_id = searchParams.get("campaign_id")
    const severity = searchParams.get("severity")

    const filters: string[] = []
    const values: any[] = []

    if (campaign_id) {
      values.push(campaign_id)
      filters.push(`campaign_id = $${values.length}`)
    }

    if (severity) {
      values.push(severity)
      filters.push(`severity = $${values.length}`)
    }

    const where =
      filters.length > 0
        ? `WHERE ${filters.join(" AND ")}`
        : ""

    const res = await pool.query(
      `
      SELECT *
      FROM audit_alerts
      ${where}
      ORDER BY created_at DESC
      LIMIT 200
      `,
      values
    )

    return NextResponse.json({
      success: true,
      alerts: res.rows
    })

  } catch (err) {
    console.error(err)

    return NextResponse.json(
      { success: false },
      { status: 500 }
    )
  }
}

