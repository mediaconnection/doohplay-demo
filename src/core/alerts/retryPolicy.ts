// @ts-nocheck
export function calculateBackoff(
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number
) {
  const exponential = baseDelayMs * Math.pow(2, attempt - 1);
  const jitter = exponential * (Math.random() * 0.4 - 0.2); // ±20%

  return Math.min(exponential + jitter, maxDelayMs);
}

