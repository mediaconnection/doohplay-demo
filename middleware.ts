// middleware.ts
//
// ⚠️ ATENÇÃO ao adicionar qualquer página pública (cadastro, login, "novo"
// etc.) dentro de /dashboard/local/, /anunciante/ ou /agencia/:
// o matcher abaixo protege TUDO que começa com esses prefixos, tratando o
// próximo segmento da URL como se fosse sempre um código de cliente/anunciante
// existente. Se a nova página não exigir sessão (ex: /anunciante/novo), ela
// precisa de uma exceção explícita igual à que existe pra "novo" abaixo —
// senão fica bloqueada por padrão, redirecionando pra /login pra sempre.
// Isso já aconteceu de verdade com /anunciante/novo (corrigido em 20/06/2026)
// e impediu cadastro de novos anunciantes sem que ninguém notasse por um tempo.
import { withAuth } from "next-auth/middleware"
import { NextRequest, NextResponse } from "next/server"
import { verifyAdvertiserSessionToken, ADVERTISER_SESSION_COOKIE } from "@/lib/advertiser-session"

// 04/10/2026: antes este middleware lia "doohplay_session", um JSON puro
// sem assinatura — qualquer um escrevia {"role":"advertiser","code":"X"}
// no navegador e entrava no portal de outro anunciante. Agora só vale o
// cookie assinado (lib/advertiser-session.ts, Web Crypto, compatível com
// o Edge Runtime). O cookie antigo é ignorado.
async function sessionMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // /dashboard/local/[code] NÃO é protegido aqui de propósito — usa um
  // sistema de sessão separado (CLIENT_SESSION_COOKIE, HMAC-SHA256 via
  // lib/client-session.ts), verificado dentro do próprio Server Component
  // (app/dashboard/local/[code]/page.tsx), que também não pode ser
  // importado aqui porque usa o módulo `crypto` do Node, incompatível com
  // o Edge Runtime deste middleware. Esta rota chegou a ficar bloqueada
  // pra sempre (redirecionava todo mundo pra /login, que nem tem o fluxo
  // de OTP por WhatsApp que o cliente real usa) porque este bloco checava
  // o cookie errado (doohplay_session em vez de doohplay_client_session) —
  // corrigido em 2026-08-27 removendo a checagem redundante e incorreta
  // daqui; page.tsx já protege a rota corretamente sozinho.

  // Protege /anunciante/[code] — mas NÃO /anunciante/novo, que é a página
  // pública de cadastro (sem sessão ainda, é quem está se cadastrando).
  // Bug anterior: o matcher tratava "novo" como se fosse um código de
  // anunciante, nunca batia, e sempre redirecionava pra login.
  if (pathname.startsWith("/anunciante/") && pathname !== "/anunciante/novo") {
    const routeCode = (pathname.split("/")[2] || "").toUpperCase()
    const token = req.cookies.get(ADVERTISER_SESSION_COOKIE)?.value
    const code = await verifyAdvertiserSessionToken(token)
    if (!code || code !== routeCode) {
      const url = new URL("/login", req.url)
      url.searchParams.set("redirect", pathname)
      if (code) url.searchParams.set("error", "unauthorized")
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
        // /dashboard/local/[code] usa sessão própria de cliente
        // (CLIENT_SESSION_COOKIE), verificada dentro do próprio Server
        // Component — não pode exigir token NextAuth aqui, senão repete o
        // bug de 2026-08-27 (bloqueava o cliente pra sempre).
        if (pathname.startsWith("/dashboard/local")) return true
        // Painel interno (/dashboard, exceto /dashboard/local) — mesma
        // exigência de sessão NextAuth do /admin (operador ou super_admin).
        if (pathname.startsWith("/dashboard")) return !!token
        // Anunciante — sempre passa aqui, sessionMiddleware cuida
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
    "/anunciante/:path*",
    "/agencia/:path*",
    "/dashboard/:path*",
  ],
}
