// lib/advertiser-session.ts
// Sessão de anunciante assinada (04/10/2026). Substitui o cookie antigo
// "doohplay_session", que era JSON puro sem assinatura — qualquer um podia
// escrever {"role":"advertiser","code":"XYZ"} no navegador e entrar no
// portal de outro anunciante (Documento-Mestre 12.62).
//
// Usa Web Crypto (crypto.subtle) em vez do módulo `crypto` do Node porque
// também é verificado no middleware.ts, que roda no Edge Runtime.
//
// Mesmo segredo da sessão de cliente (CLIENT_SESSION_SECRET), mas com
// separação de domínio: a assinatura cobre "advertiser." + payload, então
// um token de cliente nunca vale como token de anunciante (nem o contrário —
// lib/client-session.ts assina só o payload).
export const ADVERTISER_SESSION_COOKIE = "doohplay_advertiser_session"
const SESSION_DAYS = 7
export const ADVERTISER_SESSION_MAX_AGE_SECONDS = SESSION_DAYS * 86400

const DOMAIN = "advertiser."

function secret(): string {
  const s = process.env.CLIENT_SESSION_SECRET
  // Falha fechada, igual a lib/client-session.ts.
  if (!s) throw new Error("CLIENT_SESSION_SECRET não configurado")
  return s
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = ""
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)
  const bin = atob(b64)
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

async function sign(payload: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  )
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(DOMAIN + payload))
  return toBase64Url(new Uint8Array(sig))
}

// Comparação em tempo constante (não há timingSafeEqual no Edge).
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function createAdvertiserSessionToken(code: string): Promise<string> {
  const exp = Date.now() + SESSION_DAYS * 86400_000
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify({ code: code.toUpperCase(), exp })))
  return `${payload}.${await sign(payload)}`
}

// Código do anunciante se o token for válido e não expirado; null caso
// contrário. Não lança exceção.
export async function verifyAdvertiserSessionToken(token: string | undefined | null): Promise<string | null> {
  if (!token) return null
  const [payload, sig] = token.split(".")
  if (!payload || !sig) return null
  try {
    if (!safeEqual(sig, await sign(payload))) return null
    const data = JSON.parse(fromBase64Url(payload))
    if (typeof data.code !== "string" || typeof data.exp !== "number") return null
    if (Date.now() > data.exp) return null
    return data.code
  } catch {
    return null
  }
}
