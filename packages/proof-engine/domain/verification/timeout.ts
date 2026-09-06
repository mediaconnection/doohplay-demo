// @ts-nocheck
export function withTimeout<T>(
  promiseOrFn: Promise<T> | (() => Promise<T>),
  ms: number
): Promise<T> {
  const promise =
    typeof promiseOrFn === "function" ? promiseOrFn() : promiseOrFn
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
    ),
  ])
}

