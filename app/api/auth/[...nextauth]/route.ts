// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getPool } from "@/lib/db"

const handler = NextAuth({
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

        // Admin master via env (sempre funciona mesmo sem banco)
        if (
          credentials.email    === process.env.ADMIN_EMAIL    &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          return { id: "1", name: "Admin Master", email: credentials.email, role: "admin" }
        }

        // Futuramente: buscar admins no banco
        // const pool = getPool()
        // const { rows } = await pool.query(`SELECT * FROM admins WHERE email = $1`, [credentials.email])
        // if (rows[0] && await bcrypt.compare(credentials.password, rows[0].password_hash)) {
        //   return { id: rows[0].id, name: rows[0].name, email: rows[0].email, role: rows[0].role }
        // }

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
})

export { handler as GET, handler as POST }
