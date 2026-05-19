// /lib/domain/risk/engine.ts

import { pool } from "@/lib/db"
import { RiskInput } from "./schema"
import { evaluateRisk } from "./rules"
import crypto from "crypto"

/* =========================
   HASH
========================= */

function generateEvidenceHash(data: any): string {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex")
}

/* =========================
   ENGINE
========================= */

export async function autoBlockClient(
  clientId: number,
  risk: RiskInput
) {
  /* =========================
     DECISION
  ========================= */

  const decision = evaluateRisk(risk)

  if (!decision.shouldBlock) {
    return {
      blocked: false,
      reason: decision.reason
    }
  }

  /* =========================
     IDEMPOTÊNCIA
  ========================= */

  const existing = await pool.query(
    `SELECT status FROM clients WHERE id = $1`,
    [clientId]
  )

  if (existing.rows[0]?.status === "blocked") {
    return {
      blocked: false,
      reason: "already_blocked"
    }
  }

  /* =========================
     EVIDENCE
  ========================= */

  const evidencePayload = {
    clientId,
    risk,
    signals: decision.signals,
    timestamp: Date.now()
  }

  const evidenceHash = generateEvidenceHash(evidencePayload)

  /* =========================
     TRANSACTION
  ========================= */

  await pool.query("BEGIN")

  try {
    // 🚫 bloqueio
    await pool.query(
      `
      UPDATE clients
      SET status = 'blocked',
          blocked_reason = $1,
          blocked_at = NOW()
      WHERE id = $2
      `,
      [decision.reason, clientId]
    )

    // 🧾 auditoria
    await pool.query(
      `
      INSERT INTO client_blocks
      (client_id, reason, risk_snapshot, evidence_hash)
      VALUES ($1, $2, $3, $4)
      `,
      [
        clientId,
        decision.reason,
        JSON.stringify(evidencePayload),
        evidenceHash
      ]
    )

    await pool.query("COMMIT")

    return {
      blocked: true,
      reason: decision.reason,
      signals: decision.signals,
      evidenceHash
    }

  } catch (err) {
    await pool.query("ROLLBACK")
    throw err
  }
}