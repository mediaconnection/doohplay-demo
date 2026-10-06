// app/api/auth/logout/route.ts
import { NextResponse } from "next/server"
import { ADVERTISER_SESSION_COOKIE } from "@/lib/advertiser-session"

export const dynamic = "force-dynamic"

// "doohplay_session" não é mais emitido (04/10/2026); continua sendo
// apagado aqui para limpar navegadores que ainda o tenham.
const LEGACY_SESSION_COOKIE = "doohplay_session"

export async function POST() {
  const response = NextResponse.json({ ok: true })
  for (const name of [LEGACY_SESSION_COOKIE, ADVERTISER_SESSION_COOKIE]) {
    response.cookies.set(name, "", {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   0,
      path:     "/",
    })
  }
  return response
}
