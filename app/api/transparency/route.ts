export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server"

export async function GET(){
    const { pool } = await import("@/lib/db")


 const logs = await pool.query(`
  SELECT *
  FROM transparency_log
  ORDER BY log_time DESC
  LIMIT 100
 `)

 return NextResponse.json(logs.rows)
}

