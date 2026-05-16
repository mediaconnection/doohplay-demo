export function logVerification(hash: string, result: unknown): void {
  console.log("[verification]", hash, result)
}

export function logVerificationError(hash: string, error: unknown): void {
  console.error("[verification:error]", hash, error)
}
