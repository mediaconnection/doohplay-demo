export function shouldRetry(error: any): boolean {
  const transient = ["Timeout", "ECONNRESET", "ETIMEDOUT"]

  return transient.some(t =>
    error.message?.includes(t)
  )
}

export function getBackoff(attempt: number) {
  return Math.min(1000 * Math.pow(2, attempt), 15000)
}