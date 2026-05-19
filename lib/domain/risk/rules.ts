// /lib/domain/risk/rules.ts

import { RiskInput } from "./schema"

/* =========================
   TYPES
========================= */

export type BlockDecision = {
  shouldBlock: boolean
  reason: string
  signals: string[]
}

/* =========================
   THRESHOLDS (fallback rules)
========================= */

const THRESHOLDS = {
  fraudProbability: 0.9,
  anomalyLevel: 0.95,
  invalidTrafficRate: 0.5,
  chargebackRate: 0.25
}

/* =========================
   CORE RULE ENGINE
========================= */

export function evaluateRisk(risk: RiskInput): BlockDecision {
  const signals: string[] = []

  // 🔴 Regra principal (vinda do schema transform)
  if (risk.riskLevel === "critical") {
    signals.push("risk_level_critical")
  }

  // 🔴 Regras adicionais (fallback / segurança extra)
  if (risk.fraudProbability > THRESHOLDS.fraudProbability) {
    signals.push("high_fraud_probability")
  }

  if (risk.anomalyLevel > THRESHOLDS.anomalyLevel) {
    signals.push("extreme_anomaly")
  }

  if (risk.invalidTrafficRate > THRESHOLDS.invalidTrafficRate) {
    signals.push("invalid_traffic_spike")
  }

  if (risk.chargebackRate > THRESHOLDS.chargebackRate) {
    signals.push("high_chargeback_rate")
  }

  /* =========================
     DECISION LOGIC
  ========================= */

  const criticalSignals = signals.length

  const shouldBlock =
    risk.riskLevel === "critical" ||
    criticalSignals >= 2 // 🔥 evita falso positivo

  const reason =
    shouldBlock
      ? "CRITICAL_RISK_DETECTED"
      : "RISK_ACCEPTABLE"

  return {
    shouldBlock,
    reason,
    signals
  }
}

/* =========================
   SIMPLE HELPER (LEGACY SUPPORT)
========================= */

export function shouldBlockClient(risk: RiskInput): boolean {
  return evaluateRisk(risk).shouldBlock
}