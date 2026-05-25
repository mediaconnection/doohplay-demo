// @ts-nocheck
export function validateApiKey(req: Request) {
  const key = req.headers.get("x-api-key")

  if (!key || key !== process.env.PUBLIC_API_KEY) {
    return false
  }

  return true
}
