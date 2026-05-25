// @ts-nocheck
type StoredIdempotentResponse = {
  response: {
    status: number
    body: unknown
  }
  created_at: string
}

const memoryStore = new Map<string, StoredIdempotentResponse>()

const DEFAULT_TTL_MS = 1000 * 60 * 60 // 1h

function cleanupExpired(ttlMs = DEFAULT_TTL_MS) {
  const now = Date.now()

  for (const [key, value] of memoryStore.entries()) {
    const createdAt = new Date(value.created_at).getTime()

    if (Number.isNaN(createdAt) || now - createdAt > ttlMs) {
      memoryStore.delete(key)
    }
  }
}

export async function getIdempotentResponse(
  key: string
): Promise<StoredIdempotentResponse | null> {
  if (!key?.trim()) return null

  cleanupExpired()

  return memoryStore.get(key) ?? null
}

export async function storeIdempotentResponse(
  key: string,
  status: number,
  body: unknown
): Promise<StoredIdempotentResponse> {
  if (!key?.trim()) {
    throw new Error("IDEMPOTENCY_KEY_REQUIRED")
  }

  const response = {
    response: {
      status,
      body
    },
    created_at: new Date().toISOString()
  }

  memoryStore.set(key, response)

  return response
}

export async function clearIdempotentResponse(key: string): Promise<boolean> {
  return memoryStore.delete(key)
}
