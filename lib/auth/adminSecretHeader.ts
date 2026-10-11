// lib/auth/adminSecretHeader.ts
// Chamadas de máquina (cadastro, onboarding, script do Canal) se
// autenticam com o ADMIN_SECRET no cabeçalho `x-admin-secret`. Query string
// (`?secret=`) e corpo (`body.secret`) NÃO valem mais: segredo em URL fica
// gravado em log de acesso e histórico de navegador (Documento-Mestre 12.63).
import { timingSafeEqual } from "crypto"

export const ADMIN_SECRET_HEADER = "x-admin-secret"

export function hasAdminSecretHeader(req: Request): boolean {
  const expected = process.env.ADMIN_SECRET
  const got = req.headers.get(ADMIN_SECRET_HEADER)
  if (!expected || !got) return false
  const a = Buffer.from(got)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}
