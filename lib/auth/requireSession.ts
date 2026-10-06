// lib/auth/requireSession.ts
// Verificação de posse para as rotas que enviam/publicam mídia (04/10/2026,
// Documento-Mestre 12.63). Antes, essas rotas confiavam no `code` vindo do
// corpo da requisição: qualquer pessoa que soubesse o código de um cliente
// (ele aparece na URL do dashboard e da TV) podia publicar na tela dele.
//
// Retorna null quando a sessão é do dono do código; senão, a resposta
// pronta (401 sem sessão válida, 403 com sessão de outro código) — e
// registra a recusa no log, sem nunca logar o token.
import { NextRequest, NextResponse } from "next/server"
import { verifyClientSessionToken, CLIENT_SESSION_COOKIE } from "@/lib/client-session"
import { verifyAdvertiserSessionToken, ADVERTISER_SESSION_COOKIE } from "@/lib/advertiser-session"

function deny(route: string, status: 401 | 403, targetCode: string, sessionCode: string | null) {
  console.warn(`[auth] ${route}: ${status} alvo=${targetCode || "(vazio)"} sessão=${sessionCode ?? "nenhuma"}`)
  return NextResponse.json(
    { error: status === 401 ? "Não autenticado" : "Sem permissão para este código" },
    { status }
  )
}

export function decideOwner(sessionCode: string | null, targetCode: string): 200 | 401 | 403 {
  if (!sessionCode) return 401
  if (!targetCode || sessionCode.toUpperCase() !== targetCode.toUpperCase()) return 403
  return 200
}

export function requireClientOwner(req: NextRequest, targetCode: string, route: string): NextResponse | null {
  const sessionCode = verifyClientSessionToken(req.cookies.get(CLIENT_SESSION_COOKIE)?.value)
  const result = decideOwner(sessionCode, targetCode)
  return result === 200 ? null : deny(route, result, targetCode, sessionCode)
}

export async function requireAdvertiserOwner(req: NextRequest, targetCode: string, route: string): Promise<NextResponse | null> {
  const sessionCode = await verifyAdvertiserSessionToken(req.cookies.get(ADVERTISER_SESSION_COOKIE)?.value)
  const result = decideOwner(sessionCode, targetCode)
  return result === 200 ? null : deny(route, result, targetCode, sessionCode)
}
