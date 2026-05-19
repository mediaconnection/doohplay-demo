export const ALLOWED_ENTITY_TYPES = ["event", "campaign", "block"] as const

export type EntityType = (typeof ALLOWED_ENTITY_TYPES)[number]

export type RawInput = {
  hash?: unknown
  entity_id?: unknown
  entity_type?: unknown
  payload?: unknown
}

export type NormalizedInput = {
  hash: string
  entity_id: string
  entity_type: EntityType
  payload?: unknown
}

export function isValidHash(hash: string): boolean {
  return /^[a-f0-9]{64}$/i.test(hash)
}

export function isAllowedEntityType(value: unknown): value is EntityType {
  return (
    typeof value === "string" &&
    (ALLOWED_ENTITY_TYPES as readonly string[]).includes(value)
  )
}

export function normalizeInput(body: RawInput): NormalizedInput | null {
  if (typeof body.hash !== "string") return null

  if (
    typeof body.entity_id !== "string" &&
    typeof body.entity_id !== "number"
  ) {
    return null
  }

  if (!isAllowedEntityType(body.entity_type)) return null

  const hash = body.hash.trim().toLowerCase().replace(/^0x/, "")
  const entityId = String(body.entity_id).trim()

  if (!entityId) return null

  return {
    hash,
    entity_id: entityId,
    entity_type: body.entity_type,
    payload: body.payload ?? undefined
  }
}