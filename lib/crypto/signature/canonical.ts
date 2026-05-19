function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObject)
  }

  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>
    return Object.keys(obj)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortObject(obj[key])
        return acc
      }, {})
  }

  return value
}

export function canonicalizePayload(payload: unknown): string {
  return JSON.stringify(sortObject(payload))
}