// @ts-nocheck
export type ClientStatus =
  | "active"
  | "warning"
  | "blocked"

type Input = {
  riskLevel: string
  fraudProbability?: number
  blocked?: boolean
}

function normalizeRiskLevel(value: unknown): string {
  if (typeof value !== "string") {
    return "low"
  }

  return value.trim().toLowerCase()
}

export function getClientStatus(input: Input): ClientStatus {
  const riskLevel = normalizeRiskLevel(input.riskLevel)
  const fraudProbability =
    typeof input.fraudProbability === "number"
      ? input.fraudProbability
      : 0

  if (input.blocked === true || riskLevel === "critical") {
    return "blocked"
  }

  if (
    riskLevel === "high" ||
    fraudProbability > 0.7
  ) {
    return "warning"
  }

  return "active"
}

export default getClientStatus
