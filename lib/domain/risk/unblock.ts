// /lib/domain/risk/unblock.ts

import { pool } from "@/lib/db"

/* =========================
   TYPES
========================= */

type UnblockInput = {
  clientId: number
  reviewedBy: string
  decision: "approved" | "rejected"
  notes?: string
}

/* =========================
   ENGINE
========================= */

export async function reviewBlockedClient(input: UnblockInput) {
  const { clientId, reviewedBy, decision, notes } = input

  await pool.query("BEGIN")

  try {
    // 🔎 verifica status atual
    const res = await pool.query(
      `SELECT status FROM clients WHERE id = $1`,
      [clientId]
    )

    if (!res.rows[0]) {
      throw new Error("Client not found")
    }

    const status = res.rows[0].status

    if (status !== "blocked") {
      return {
        success: false,
        reason: "client_not_blocked"
      }
    }

    /* =========================
       DECISION
    ========================= */

    if (decision === "approved") {
      // 🔓 desbloqueia
      await pool.query(
        `
        UPDATE clients
        SET status = 'active',
            blocked_reason = NULL,
            blocked_at = NULL
        WHERE id = $1
        `,
        [clientId]
      )
    }

    /* =========================
       AUDIT LOG
    ========================= */

    await pool.query(
      `
      INSERT INTO client_block_reviews
      (client_id, decision, reviewed_by, review_notes)
      VALUES ($1, $2, $3, $4)
      `,
      [clientId, decision, reviewedBy, notes || null]
    )

    await pool.query("COMMIT")

    return {
      success: true,
      decision
    }

  } catch (err) {
    await pool.query("ROLLBACK")
    throw err
  }
}