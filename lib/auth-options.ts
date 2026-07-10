// lib/auth-options.ts
// Configuração do NextAuth extraída do arquivo de rota. Precisa ficar
// exportada separadamente (e ser passada explicitamente pra
// getServerSession(authOptions)) pra funcionar de forma confiável em rotas
// que checam campos customizados como `role` — chamar getServerSession()
// sem argumentos pode não repassar os callbacks jwt/session de forma
// confiável em todos os contextos de execução.
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getPool } from "@/lib/db"
import { verifyPassword } from "@/lib/password"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 }, // 8 horas

  pages: {
    signIn: "/admin/login",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",  type: "email"    },
        password: { label: "Senha",  type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Admin master via env — sempre funciona mesmo sem banco, chave de
        // emergência que nunca pode ficar bloqueada.
        if (
          credentials.email    === process.env.ADMIN_EMAIL    &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          return { id: "1", name: "Admin Master", email: credentials.email, role: "super_admin" } as any
        }

        // Fase 13 — usuários admin cadastrados no banco, cada um com seu
        // próprio papel (super_admin ou operador).
        try {
          const pool = getPool()
          const { rows } = await pool.query(
            `SELECT id, name, email, password_hash, role FROM admin_users WHERE email = $1 AND active = true LIMIT 1`,
            [credentials.email]
          )
          const user = rows[0]
          if (user && verifyPassword(credentials.password, user.password_hash)) {
            pool.query(`UPDATE admin_users SET last_login_at = NOW() WHERE id = $1`, [user.id]).catch(() => {})
            return { id: user.id, name: user.name, email: user.email, role: user.role } as any
          }
        } catch (err) {
          console.error("[nextauth authorize] erro ao checar admin_users:", err)
        }

        return null
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role
      return token
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role
      return session
    },
  },
}
