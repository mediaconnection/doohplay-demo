export type ProofResponse = {
  hash: string
  status: "VERIFIED" | "WARNING" | "FAILED" | "PENDING"
  score?: number
  trust_level?: "HIGH" | "MEDIUM" | "LOW"
  error?: string
}

export function buildProofResponse(data: Partial<ProofResponse>): ProofResponse {
  return {
    hash: data.hash ?? "",
    status: data.status ?? "FAILED",
    score: data.score,
    trust_level: data.trust_level,
    error: data.error,
  }
}
