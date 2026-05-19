import { ALERT_POLICY_LIST } from "../policies"
import type { AlertContext, AlertPolicy } from "../policies/types"

export type PolicyEvaluationResult =
  | {
      matched: true
      policy: AlertPolicy
    }
  | {
      matched: false
      reason: "NO_POLICY_MATCH"
    }

export function evaluatePolicies(ctx: AlertContext): PolicyEvaluationResult {
  for (const policy of ALERT_POLICY_LIST) {
    try {
      if (policy.condition(ctx)) {
        return {
          matched: true,
          policy
        }
      }
    } catch (error) {
      console.warn("ALERT_POLICY_EVALUATION_FAILED", {
        policy: policy.type,
        error
      })
    }
  }

  return {
    matched: false,
    reason: "NO_POLICY_MATCH"
  }
}