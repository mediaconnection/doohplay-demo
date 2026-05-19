import type { AlertPolicy } from "./types"
import { PLAYER_OFFLINE_POLICY } from "./playerOffline"

/* =========================
   POLICIES MAP (STRONG TYPE)
========================= */

export const ALERT_POLICIES = {
  PLAYER_OFFLINE: PLAYER_OFFLINE_POLICY
} as const satisfies Record<string, AlertPolicy>

/* =========================
   VALIDATION (DEV SAFETY)
========================= */

function validatePolicies(policies: Record<string, AlertPolicy>) {
  for (const [key, policy] of Object.entries(policies)) {
    if (!policy || typeof policy !== "object") {
      throw new Error(`INVALID_POLICY_OBJECT: ${key}`)
    }

    if (policy.type !== key) {
      console.warn(
        `ALERT_POLICY_TYPE_MISMATCH: key=${key} policy.type=${policy.type}`
      )
    }

    if (typeof policy.condition !== "function") {
      throw new Error(`INVALID_POLICY_CONDITION: ${key}`)
    }

    if (!policy.risk || typeof policy.risk.base !== "number") {
      throw new Error(`INVALID_POLICY_RISK: ${key}`)
    }
  }
}

/* =========================
   INIT VALIDATION
========================= */

if (process.env.NODE_ENV !== "production") {
  validatePolicies(ALERT_POLICIES)
}

/* =========================
   ORDERED LIST (ENGINE SAFE)
========================= */

export const ALERT_POLICY_LIST: AlertPolicy[] = [
  ALERT_POLICIES.PLAYER_OFFLINE
]

/* =========================
   DEFAULT EXPORT
========================= */

export default ALERT_POLICIES