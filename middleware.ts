// middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextRequest, NextResponse } from "next/server"

const SESSION_COOKIE = "doohplay_session"

function sessionMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const session = req.cookies.get(SESSION_COOKIE)

  let role: string | null = null
  let code: string | null = null

  if (session) {
    try {
      const data = JSON.parse(session.value)
      role = data.role
      code = data.code
    } catch {}
  }

  // Protege /dashboard/local/[code]
  if (pathname.startsWith("/dashboard/local/")) {
    const routeCode = pathname.split("/")[3]
    if (!session || role !== "client" || code !== routeCode) {
      const url = new URL("/login", req.url)
      url.searchParams.set("redirect", pathname)
      if (session) url.searchParams.set("error", "unauthorized")
      return NextResponse.redirect(url)
    }
  }

  // Protege /anunciante/[code]
  if (pathname.startsWith("/anunciante/")) {
    const routeCode = pathname.split("/")[2]
    if (!session || role !== "advertiser" || code !== routeCode) {
      const url = new URL("/login", req.url)
      url.searchParams.set("redirect", pathname)
      if (session) url.searchParams.set("error", "unauthorized")
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

// Middleware principal — combina NextAuth (admin) + session (client/advertiser)
export default withAuth(
  function middleware(req) {
    return sessionMiddleware(req as unknown as NextRequest)
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const { pathname } = req.nextUrl
        // Admin requer token NextAuth
        if (pathname.startsWith("/admin")) return !!token
        // Dashboard e anunciante — sempre passa aqui, sessionMiddleware cuida
        return true
      },
    },
    pages: {
      signIn: "/admin/login",
    },
  }
)

export const config = {
  matcher: [
    "/admin/((?!login).*)",
    "/dashboard/local/:path*",
    "/anunciante/:path*",
    "/agencia/:path*",
  ],
}
