// app/studio/[code]/page.tsx
// 04/10/2026: o Studio publica direto na TV e não tinha login nenhum —
// bastava saber o código do cliente. Agora a sessão é conferida aqui, no
// servidor, com a mesma tela de login do dashboard
// (app/dashboard/local/[code]/page.tsx). As rotas que o Studio chama
// (upload, publish, ai-generate, PATCH da playlist) também exigem a
// sessão, então esta página não é a única proteção.
export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { getPool } from "@/lib/db"
import { verifyClientSessionToken, CLIENT_SESSION_COOKIE } from "@/lib/client-session"
import ClientLoginGate from "../../dashboard/local/[code]/client-login-gate"
import StudioEditor from "./studio-editor"

export default async function StudioPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const upperCode = code.toUpperCase()

  const pool = getPool()
  const existsRes = await pool.query(
    `SELECT name FROM studio_clients WHERE UPPER(code) = $1 AND active = true LIMIT 1`,
    [upperCode]
  )
  if (!existsRes.rows[0]) return notFound()

  const cookieStore = await cookies()
  const sessionCode = verifyClientSessionToken(cookieStore.get(CLIENT_SESSION_COOKIE)?.value)
  if (sessionCode !== upperCode) {
    return <ClientLoginGate code={upperCode} clientName={existsRes.rows[0].name} />
  }

  return <StudioEditor params={{ code: upperCode }} />
}
