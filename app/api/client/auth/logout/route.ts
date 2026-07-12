// app/api/client/auth/logout/route.ts
import { NextResponse } from "next/server"
import { CLIENT_SESSION_COOKIE } from "@/lib/client-session"

export const dynamic = "force-dynamic"

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(CLIENT_SESSION_COOKIE, "", { path: "/", maxAge: 0 })
  return res
}
