export async function withTimeout<T>(
  fn: () => Promise<T>,
  ms: number
): Promise<T> {
  if (!Number.isFinite(ms) || ms <= 0) {
    throw new Error("INVALID_TIMEOUT")
  }

  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("TIMEOUT"))
    }, ms)
  })

  try {
    return await Promise.race([fn(), timeoutPromise])
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }
  }
}