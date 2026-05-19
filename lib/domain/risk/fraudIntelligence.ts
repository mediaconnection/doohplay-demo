// /lib/domain/risk/fraudIntelligence.ts

import { pool } from "@/lib/db"
import { RiskInput } from "./schema"

export async function updateClientRiskStats(
  clientId: number,
  risk: RiskInput,
  blocked: boolean
) {

  await pool.query(`
    INSERT INTO client_risk_stats (
      client_id,
      total_events,
      blocked_events,
      avg_risk_score,
      last_risk_level
    )
    VALUES ($1, 1, $2, $3, $4)
    ON CONFLICT (client_id)
    DO UPDATE SET
      total_events = client_risk_stats.total_events + 1,
      blocked_events = client_risk_stats.blocked_events + $2,
      avg_risk_score = (
        (client_risk_stats.avg_risk_score * client_risk_stats.total_events + $3)
        / (client_risk_stats.total_events + 1)
      ),
      last_risk_level = $4,
      updated_at = NOW()
  `, [
    clientId,
    blocked ? 1 : 0,
    risk.score,
    risk.riskLevel
  ])
}