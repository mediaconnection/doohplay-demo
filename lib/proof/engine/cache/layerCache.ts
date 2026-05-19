type LayerCacheValue = Record<string, unknown>

type LayerCacheEntry = {
  value: LayerCacheValue
  expiresAt: number
}

const layerCache = new Map<string, LayerCacheEntry>()

const DEFAULT_LAYER_TTL_SECONDS = 60

function toExpiresAt(ttlSeconds: number): number {
  const safeTtl =
    Number.isFinite(ttlSeconds) && ttlSeconds > 0
      ? ttlSeconds
      : DEFAULT_LAYER_TTL_SECONDS

  return Date.now() + safeTtl * 1000
}

export async function getLayerCache(
  key: string
): Promise<LayerCacheValue | null> {
  const entry = layerCache.get(key)

  if (!entry) return null

  if (Date.now() >= entry.expiresAt) {
    layerCache.delete(key)
    return null
  }

  return entry.value
}

export async function setLayerCache(
  key: string,
  value: LayerCacheValue,
  ttlSeconds = DEFAULT_LAYER_TTL_SECONDS
): Promise<void> {
  layerCache.set(key, {
    value,
    expiresAt: toExpiresAt(ttlSeconds)
  })
}

export async function deleteLayerCache(key: string): Promise<void> {
  layerCache.delete(key)
}

export async function clearLayerCache(): Promise<void> {
  layerCache.clear()
}