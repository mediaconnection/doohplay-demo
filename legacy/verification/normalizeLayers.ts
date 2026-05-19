export type VerificationLayer = {
  name: string
  valid: boolean
  weight?: number | null
  reasons?: string[] | null
  message?: string | null
  error?: string | null
  details?: Record<string, unknown> | null
  meta?: Record<string, unknown> | null
  duration_ms?: number | null
}

function getDefaultWeight(name: string): number {
  switch (name) {
    case "icp":
      return 40
    case "merkle":
      return 30
    case "blockchain":
      return 30
    case "signature":
      return 40
    default:
      return 10
  }
}

export function normalizeLayers(
  layers: VerificationLayer[]
): VerificationLayer[] {
  return layers.map((layer) => ({
    name: layer.name,
    valid: Boolean(layer.valid),
    weight:
      typeof layer.weight === "number"
        ? layer.weight
        : getDefaultWeight(layer.name),
    reasons: Array.isArray(layer.reasons) ? layer.reasons : [],
    message: layer.message ?? null,
    error: layer.error ?? null,
    details: layer.details ?? null,
    meta: layer.meta ?? null,
    duration_ms:
      typeof layer.duration_ms === "number" &&
      Number.isFinite(layer.duration_ms)
        ? layer.duration_ms
        : null
  }))
}
