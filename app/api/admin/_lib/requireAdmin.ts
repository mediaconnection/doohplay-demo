// app/api/admin/_lib/requireAdmin.ts
// Autorização das rotas destrutivas do admin (11/10/2026, Documento-Mestre
// 12.63). Só vale a sessão NextAuth (JWT assinado com NEXTAUTH_SECRET),
// lida com authOptions pra trazer o papel. O atalho `?secret=ADMIN_SECRET`
// NÃO é aceito aqui: segredo em URL fica gravado em log de acesso e
// histórico de navegador, e era a única proteção de rotas que apagam dados.
//
// Retorna null quando pode seguir; senão a resposta pronta (401 sem sessão,
// 403 com sessão sem papel de admin), sempre registrada no log.
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

const ADMIN_ROLES = ["super_admin", "operador"]

export type AdminCheck = { denied: NextResponse; email: null } | { denied: null; email: string }

export async function requireAdminSession(route: string): Promise<AdminCheck> {
  const session = await getServerSession(authOptions)
  const user = session?.user as { email?: string | null; role?: string } | undefined

  if (!user) {
    console.warn(`[auth] ${route}: 401 sem sessão de admin`)
    return { denied: NextResponse.json({ error: "Não autenticado" }, { status: 401 }), email: null }
  }
  if (!user.role || !ADMIN_ROLES.includes(user.role)) {
    console.warn(`[auth] ${route}: 403 papel=${user.role ?? "(nenhum)"} usuário=${user.email ?? "?"}`)
    return { denied: NextResponse.json({ error: "Sem permissão" }, { status: 403 }), email: null }
  }
  return { denied: null, email: user.email ?? "?" }
}
