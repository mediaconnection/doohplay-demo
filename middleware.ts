// middleware.ts (raiz do projeto)
export { default } from "next-auth/middleware"

export const config = {
  matcher: ["/admin/:path*"],
}
