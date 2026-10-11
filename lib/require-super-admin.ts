// lib/require-super-admin.ts
// Helper de autorização mais restrito que o checkAuth comum (qualquer admin
// logado) — usado pra rotas sensíveis (financeiro, gestão de usuários).
// Chamada de máquina (app/api/onboarding → finance/asaas) com o ADMIN_SECRET
// no cabeçalho x-admin-secret continua tratada como equivalente a
// super_admin. ?secret= na URL não vale mais.
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { hasAdminSecretHeader } from "@/lib/auth/adminSecretHeader"

export async function requireSuperAdmin(req: NextRequest): Promise<boolean> {
  if (hasAdminSecretHeader(req)) return true

  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  return !!session?.user && role === "super_admin"
}
