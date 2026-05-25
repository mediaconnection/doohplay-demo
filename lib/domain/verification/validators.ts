// @ts-nocheck
export function isValidSha256(hash: unknown): hash is string {
  return typeof hash === "string" && /^[a-f0-9]{64}$/i.test(hash)
}

export function isValidHash(hash: unknown): hash is string {
  return isValidSha256(hash)
}

export function isValidUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    )
  )
}

export function normalizeInput<T extends Record<string, unknown>>(
  input: unknown
): T | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null
  return input as T
}

