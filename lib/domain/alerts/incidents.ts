// @ts-nocheck
import { pool } from "@/lib/db"

/* =========================
   TYPES
========================= */

type CreateIncidentInput = {
  client_id: number
  risk_score: number
  risk_label: string
  alerts: string[]
}

/* =========================
   CREATE INCIDENT
========================= */

export async function createIncident(input: CreateIncidentInput) {
  const { client_id, risk_score, risk_label, alerts } = input

  try {
    /* =========================
       RULE: só alto risco
    ========================= */

    if (risk_score < 70) {
      return null
    }

    /* =========================
       INSERT
    ========================= */

    const res = await pool.query(
      `
      INSERT INTO incidents (
        client_id,
        risk_score,
        risk_label,
        alerts,
        status,
        created_at
      )
      VALUES ($1, $2, $3, $4, 'open', NOW())
      RETURNING id
      `,
      [
        client_id,
        risk_score,
        risk_label,
        JSON.stringify(alerts),
      ]
    )

    return res.rows[0]

  } catch (err) {
    console.error("Create incident error:", err)
    return null
  }
}
