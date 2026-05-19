export type AlertInput = {
  type: string
  sourceId?: string
  metadata?: Record<string, unknown>
}

export type AlertPolicySeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

export type AlertPolicy = {
  type: string
  severity: AlertPolicySeverity
  enabled: boolean
  description: string
}

export type AlertPolicyContext = {
  input: AlertInput
  now: Date
}

export type AlertPolicyResult =
  | {
      matched: true
      policy: AlertPolicy
    }
  | {
      matched: false
      policy: null
    }

export const ALERT_POLICIES: AlertPolicy[] = [
  {
    type: "PLAYER_OFFLINE",
    severity: "HIGH",
    enabled: true,
    description: "Player ficou offline ou deixou de enviar heartbeat."
  },
  {
    type: "PLAYER_HEARTBEAT_MISSING",
    severity: "HIGH",
    enabled: true,
    description: "Heartbeat do player não foi recebido dentro da janela esperada."
  },
  {
    type: "PROOF_FAILED",
    severity: "CRITICAL",
    enabled: true,
    description: "Falha crítica na validação de prova criptográfica."
  },
  {
    type: "MERKLE_MISMATCH",
    severity: "CRITICAL",
    enabled: true,
    description: "Merkle root ou Merkle proof inconsistente."
  },
  {
    type: "BLOCKCHAIN_ANCHOR_FAILED",
    severity: "HIGH",
    enabled: true,
    description: "Falha ou ausência de ancoragem blockchain."
  },
  {
    type: "LOW_TRUST_SCORE",
    severity: "MEDIUM",
    enabled: true,
    description: "Score de confiança abaixo do limite esperado."
  }
]

export function evaluatePolicies(ctx: AlertPolicyContext): AlertPolicyResult {
  const alertType = ctx.input.type?.trim()

  if (!alertType) {
    return {
      matched: false,
      policy: null
    }
  }

  const policy = ALERT_POLICIES.find(
    (item: AlertPolicy) => item.enabled && item.type === alertType
  )

  if (!policy) {
    return {
      matched: false,
      policy: null
    }
  }

  return {
    matched: true,
    policy
  }
}