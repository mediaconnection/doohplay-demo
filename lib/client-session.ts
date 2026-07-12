// lib/client-session.ts
// Sessão de cliente (Fase 14) — cookie assinado com HMAC-SHA256 nativo do
// Node (módulo `crypto`, sem dependência nova, mesmo espírito de
// lib/password.ts). Deliberadamente SEPARADO do NextAuth usado pelo
// admin/operador — session de cliente é sempre "um código só", não tem
// papel/role, então não faz sentido compartilhar o mesmo mecanismo, e
// assim fica impossível um bug aqui vazar pra autenticação do admin (ou
// vice-versa).
import { createHmac, timingSafeEqual } from "crypto"

export const CLIENT_SESSION_COOKIE = "doohplay_client_session"
const SESSION_DAYS = 30

function secret(): string {
  const s = process.env.CLIENT_SESSION_SECRET
  if (!s) {
    // Falha fechada de propósito: sem secret configurado, ninguém consegue
    // criar nem validar sessão — melhor travar o login do que rodar com um
    // segredo previsível/ausente.
    throw new Error("CLIENT_SESSION_SECRET não configurado")
  }
  return s
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url")
}

export function createClientSessionToken(code: string): string {
  const exp = Date.now() + SESSION_DAYS * 86400_000
  const payload = Buffer.from(JSON.stringify({ code: code.toUpperCase(), exp })).toString("base64url")
  const sig = sign(payload)
  return `${payload}.${sig}`
}

// Retorna o código do cliente se o token for válido e ainda não tiver
// expirado, ou null caso contrário. Não lança exceção — chamador só
// precisa checar null.
export function verifyClientSessionToken(token: string | undefined | null): string | null {
  if (!token) return null
  const [payload, sig] = token.split(".")
  if (!payload || !sig) return null

  try {
    const expectedSig = sign(payload)
    const sigBuf = Buffer.from(sig)
    const expectedBuf = Buffer.from(expectedSig)
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) return null

    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"))
    if (typeof data.code !== "string" || typeof data.exp !== "number") return null
    if (Date.now() > data.exp) return null

    return data.code
  } catch {
    return null
  }
}

export const CLIENT_SESSION_MAX_AGE_SECONDS = SESSION_DAYS * 86400
