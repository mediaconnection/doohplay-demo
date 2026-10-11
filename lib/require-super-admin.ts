// lib/require-super-admin.ts
// Helper de autorização mais restrito que o checkAuth comum (qualquer admin
// logado) — usado pra rotas sensíveis (financeiro, gestão de usuários).
// Só sessão NextAuth com papel super_admin. O ADMIN_SECRET (em URL, corpo
// ou cabeçalho) NÃO vale aqui: a única rota com chamador de máquina é
// finance/asaas, que checa o cabeçalho por conta própria.
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export async function requireSuperAdmin(_req: NextRequest): Promise<boolean> {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  return !!session?.user && role === "super_admin"
}
