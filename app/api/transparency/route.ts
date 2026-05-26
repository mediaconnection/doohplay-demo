export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { pool } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(){

 const logs = await pool.query(`
  SELECT *
  FROM transparency_log
  ORDER BY log_time DESC
  LIMIT 100
 `)

 return NextResponse.json(logs.rows)
}

