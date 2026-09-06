// @ts-nocheck
export function logVerification(hash: string, result: unknown): void {
  console.log("[verification]", hash, result)
}

export function logVerificationError(hash: string, error: unknown): void {
  console.error("[verification:error]", hash, error)
}

export function logError(message: string, context?: unknown): void {
  console.error("[verification:error]", message, context)
}

export function logWarn(message: string, context?: unknown): void {
  console.warn("[verification:warn]", message, context)
}

