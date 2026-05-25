// @ts-nocheck
import { pool } from "@/lib/db"

export async function logExecution(data: {
  eventId: number
  clientId: number
  status: string
  error?: string
}) {
  await pool.query(`
    INSERT INTO job_audit (
      event_id,
      client_id,
      status,
      error,
      created_at
    )
    VALUES ($1, $2, $3, $4, NOW())
  `, [
    data.eventId,
    data.clientId,
    data.status,
    data.error || null
  ])
}
