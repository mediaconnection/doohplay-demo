// app/api/client/auth/logout/route.ts
import { NextResponse } from "next/server"
import { CLIENT_SESSION_COOKIE } from "@/lib/client-session"

export const dynamic = "force-dynamic"

// "doohplay_session" (mesmo nome usado em middleware.ts e
// app/api/auth/otp/verify/route.ts) é um segundo cookie de sessão,
// paralelo ao CLIENT_SESSION_COOKIE — setado também quando o cliente loga
// pelo /login genérico (role "client") em vez do gate de WhatsApp embutido
// no dashboard. Sem limpar os dois aqui, "Sair" deixava esse cookie
// fantasma válido (achado 2026-09-09).
const LEGACY_SESSION_COOKIE = "doohplay_session"

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(CLIENT_SESSION_COOKIE, "", { path: "/", maxAge: 0 })
  res.cookies.set(LEGACY_SESSION_COOKIE, "", { path: "/", maxAge: 0 })
  return res
}
