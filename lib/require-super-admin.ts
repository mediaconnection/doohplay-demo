// lib/require-super-admin.ts
// Helper de autorização mais restrito que o checkAuth comum (qualquer admin
// logado) — usado pra rotas sensíveis (financeiro, gestão de usuários).
// Acesso via ?secret= (cron jobs, automações) continua tratado como
// equivalente a super_admin, já que hoje esse secret já dá acesso total.
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"

export async function requireSuperAdmin(req: NextRequest): Promise<boolean> {
  const secret = req.nextUrl.searchParams.get("secret")
  if (secret && secret === process.env.ADMIN_SECRET) return true

  const session = await getServerSession()
  const role = (session?.user as any)?.role
  return !!session?.user && role === "super_admin"
}
