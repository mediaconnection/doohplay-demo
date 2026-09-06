// @ts-nocheck
// /lib/domain/analytics/computeRisk.ts

import { RiskSchema, RiskInput } from "@proof-engine/domain/risk/schema"

/* =========================
   TYPES (INPUT RAW)
========================= */

type ComputeRiskInput = {
  score?: number
  fraudProbability?: number
  anomaly?: number
  invalidRate?: number
  chargeback?: number

  // dados extras (futuro ML)
  impressions?: number
  clicks?: number
  conversions?: number
}

/* =========================
   HELPERS
========================= */

function safeDivide(a: number, b: number): number {
  if (!b || b === 0) return 0
  return a / b
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value))
}

/* =========================
   CORE COMPUTE
========================= */

export function computeRisk(input: ComputeRiskInput): RiskInput {
  /* =========================
     NORMALIZAÇÃO BASE
  ========================= */

  const impressions = input.impressions ?? 0
  const clicks = input.clicks ?? 0
  const conversions = input.conversions ?? 0

  // CTR e CVR (base para heurística futura)
  const ctr = safeDivide(clicks, impressions)
  const cvr = safeDivide(conversions, clicks)

  /* =========================
     COMPONENTES DE RISCO
  ========================= */

  const fraudProbability =
    input.fraudProbability ??
    clamp(
      0.6 * (1 - cvr) + // baixa conversão aumenta risco
      0.4 * ctr         // CTR anormal pode indicar bot
    )

  const anomalyLevel =
    input.anomaly ??
    clamp(Math.abs(ctr - 0.05) * 10) // distância de baseline

  const invalidTrafficRate =
    input.invalidRate ??
    clamp(ctr > 0.3 ? 0.7 : 0.1) // CTR muito alto → suspeito

  const chargebackRate =
    input.chargeback ?? 0

  const score =
    input.score ??
    Math.round(
      100 *
        (1 -
          (fraudProbability * 0.4 +
           anomalyLevel * 0.3 +
           invalidTrafficRate * 0.2 +
           chargebackRate * 0.1))
    )

  /* =========================
     FINAL (ZOD SOURCE OF TRUTH)
  ========================= */

  return RiskSchema.parse({
    score,
    fraudProbability,
    anomalyLevel,
    invalidTrafficRate,
    chargebackRate
  })
}
