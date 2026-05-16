export function createRequestId(): string {
  return crypto.randomUUID()
}

export function getIP(req: Request): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null
}

export function isJsonRequest(req: Request): boolean {
  return req.headers.get("content-type")?.includes("application/json") ?? false
}

export function isTooLarge(req: Request, maxBytes = 1_048_576): boolean {
  const len = req.headers.get("content-length")
  return len !== null && parseInt(len, 10) > maxBytes
}

export async function parseJsonBody<T = unknown>(req: Request): Promise<T> {
  return req.json() as Promise<T>
}

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 10_000
): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(id)
  }
}
