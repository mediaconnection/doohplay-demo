/* =========================
   TYPES
========================= */

type KeyPart = string | number | null | undefined

type KeysApi = {
  proof: (hash: string, entityId: string, entityType: string) => string
  icp: {
    (hash: string, entityId?: string, entityType?: string): string
  }
  merkle: {
    (leafKey: string, root?: string): string
  }
  tx: (txHash: string) => string
}

/* =========================
   HELPERS
========================= */

function normalizePart(value: KeyPart): string {
  if (value === null || value === undefined) return "unknown"

  const normalized = String(value).trim().toLowerCase()
  return normalized || "unknown"
}

function normalizeHash(value: KeyPart): string {
  const normalized = normalizePart(value).replace(/^0x/, "")
  return normalized || "unknown"
}

function normalizeTxHash(value: KeyPart): string {
  const normalized = normalizeHash(value)
  return normalized === "unknown" ? normalized : `0x${normalized}`
}

function joinKey(...parts: KeyPart[]): string {
  return parts.map(normalizePart).join(":")
}

/* =========================
   KEY BUILDERS
========================= */

function proofKey(hash: string, entityId: string, entityType: string): string {
  return joinKey("proof", entityType, entityId, normalizeHash(hash))
}

function icpKey(hash: string, entityId?: string, entityType?: string): string {
  if (entityId && entityType) {
    return joinKey("layer", "icp", entityType, entityId, normalizeHash(hash))
  }

  return joinKey("layer", "icp", normalizeHash(hash))
}

function merkleKey(leafKey: string, root?: string): string {
  const normalizedLeaf = normalizePart(leafKey)
  const normalizedRoot = root ? normalizeHash(root) : "unknown"

  return joinKey("layer", "merkle", normalizedLeaf, normalizedRoot)
}

function txKey(txHash: string): string {
  return joinKey("layer", "tx", normalizeTxHash(txHash))
}

/* =========================
   PUBLIC API
========================= */

export const keys: KeysApi = {
  proof: proofKey,
  icp: icpKey,
  merkle: merkleKey,
  tx: txKey
}