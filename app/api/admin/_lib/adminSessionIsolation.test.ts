// Isolamento entre a sessão de admin (NextAuth) e as sessões de cliente e
// anunciante (cookies HMAC próprios) — revisão externa do 7ac2064, 11/10/2026.
// Várias rotas de painel checam só "existe sessão NextAuth", sem papel: isso
// só é seguro enquanto cliente e anunciante não conseguirem sessão NextAuth.
import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"
import { decode } from "next-auth/jwt"
import fs from "fs"
import path from "path"

const { queryMock, sessionMock } = vi.hoisted(() => ({ queryMock: vi.fn(), sessionMock: vi.fn() }))

vi.mock("@/lib/db", () => ({
  getPool: () => ({ query: queryMock, connect: async () => ({ query: queryMock, release: () => {} }) }),
}))
vi.mock("next-auth", () => ({ getServerSession: sessionMock }))
vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class { send = vi.fn() },
  ListObjectsV2Command: class {}, DeleteObjectCommand: class {}, DeleteObjectsCommand: class {},
  PutObjectCommand: class {}, GetObjectCommand: class {}, HeadObjectCommand: class {},
}))
vi.mock("@/lib/asaas", () => ({
  PLANS: { starter: { name: "Starter", value: 97 } },
  getOrCreateAsaasCustomer: vi.fn(async () => ({ id: "cus_teste" })),
  createSubscription: vi.fn(async () => ({ id: "sub_teste" })),
  cancelSubscription: vi.fn(async () => ({})),
}))

import * as fleetRoute from "@/app/api/admin/fleet/route"
import * as statsRoute from "@/app/api/admin/stats/route"
import * as r2CleanupRoute from "@/app/api/admin/r2-cleanup/[code]/route"
import * as usersRoute from "@/app/api/admin/users/route"
import * as subscriptionRoute from "@/app/api/admin/subscription/route"
import * as closeMonthRoute from "@/app/api/finance/close-month/route"
import * as asaasRoute from "@/app/api/finance/asaas/route"
import * as verifyMigrationRoute from "@/app/api/admin/verify-migration/[code]/route"
import * as asaasLib from "@/lib/asaas"
import { createClientSessionToken, verifyClientSessionToken, CLIENT_SESSION_COOKIE } from "@/lib/client-session"
import { createAdvertiserSessionToken, verifyAdvertiserSessionToken, ADVERTISER_SESSION_COOKIE } from "@/lib/advertiser-session"

const ADMIN_SECRET = "segredo-admin-de-teste"
const SHARED = "segredo-de-sessao-de-teste"
const NEXTAUTH_COOKIES = ["next-auth.session-token", "__Secure-next-auth.session-token"]
const code = (v: string) => ({ params: Promise.resolve({ code: v }) })

beforeEach(() => {
  process.env.ADMIN_SECRET = ADMIN_SECRET
  process.env.CLIENT_SESSION_SECRET = SHARED
  queryMock.mockReset(); sessionMock.mockReset()
  queryMock.mockResolvedValue({ rows: [], rowCount: 0 })
  sessionMock.mockResolvedValue(null)
  vi.mocked(asaasLib.createSubscription).mockClear()
  vi.mocked(asaasLib.cancelSubscription).mockClear()
  for (const m of ["warn", "log", "error"] as const) vi.spyOn(console, m).mockImplementation(() => {})
})

// Cookies válidos de cliente e de anunciante, inclusive copiados para os
// nomes de cookie do NextAuth (o que um atacante tentaria).
async function nonAdminCookieHeader(): Promise<string> {
  const client = createClientSessionToken("TESTE_A")
  const advertiser = await createAdvertiserSessionToken("TESTE_ADV")
  expect(verifyClientSessionToken(client)).toBe("TESTE_A")
  expect(await verifyAdvertiserSessionToken(advertiser)).toBe("TESTE_ADV")
  return [
    `${CLIENT_SESSION_COOKIE}=${client}`,
    `${ADVERTISER_SESSION_COOKIE}=${advertiser}`,
    ...NEXTAUTH_COOKIES.map(n => `${n}=${client}`),
  ].join("; ")
}

type Case = { name: string; call: (headers: Record<string, string>) => Promise<Response> }
const get = (url: string, headers: Record<string, string>) => new NextRequest(url, { headers })
const send = (method: string, url: string, body: unknown, headers: Record<string, string>) =>
  new NextRequest(url, { method, body: JSON.stringify(body), headers: { "content-type": "application/json", ...headers } })

// Uma rota de cada tipo de checagem que existe hoje.
const adminRoutes: Case[] = [
  { name: "getServerSession() sem papel — GET admin/fleet",
    call: h => fleetRoute.GET(get("http://x/api/admin/fleet", h)) },
  { name: "getServerSession(authOptions) — GET admin/stats",
    call: h => statsRoute.GET(get("http://x/api/admin/stats", h)) },
  { name: "requireAdminSession — GET admin/r2-cleanup/[code]",
    call: h => r2CleanupRoute.GET(get("http://x/api/admin/r2-cleanup/TESTE_A", h), code("TESTE_A")) },
  { name: "requireSuperAdmin — GET admin/users",
    call: h => usersRoute.GET(get("http://x/api/admin/users", h)) },
  { name: "sessão ou cabeçalho — GET finance/asaas",
    call: h => asaasRoute.GET(get("http://x/api/finance/asaas?code=TESTE_A", h)) },
  { name: "só cabeçalho — GET admin/verify-migration/[code]",
    call: h => verifyMigrationRoute.GET(get("http://x/api/admin/verify-migration/TESTE_A", h), code("TESTE_A")) },
]

describe("cookies de cliente e de anunciante não abrem rota de admin", () => {
  for (const tc of adminRoutes) {
    it(`${tc.name} → 401, sem tocar no banco`, async () => {
      const res = await tc.call({ cookie: await nonAdminCookieHeader() })
      expect(res.status).toBe(401)
      expect(queryMock).not.toHaveBeenCalled()
    })
  }
})

describe("token de cliente ou anunciante não é um JWT do NextAuth", () => {
  // Mesmo no pior caso (NEXTAUTH_SECRET igual ao CLIENT_SESSION_SECRET), o
  // decodificador real do NextAuth não aceita esses tokens.
  it("decode() real do next-auth/jwt rejeita os dois tokens", async () => {
    const tokens = [createClientSessionToken("TESTE_A"), await createAdvertiserSessionToken("TESTE_ADV")]
    for (const token of tokens) {
      const decoded = await decode({ token, secret: SHARED }).catch(() => null)
      expect(decoded).toBeNull()
    }
  })
})

describe("requireSuperAdmin: só sessão de super_admin — o ADMIN_SECRET não vale", () => {
  const h = { "x-admin-secret": ADMIN_SECRET }
  const superAdminOnly: Case[] = [
    { name: "GET admin/users", call: x => usersRoute.GET(get("http://x/api/admin/users", x)) },
    { name: "POST admin/users", call: x => usersRoute.POST(send("POST", "http://x/api/admin/users",
        { name: "TESTE_", email: "teste@exemplo.invalid", password: "senha-de-teste-123", role: "super_admin" }, x)) },
    { name: "PATCH admin/users", call: x => usersRoute.PATCH(send("PATCH", "http://x/api/admin/users", { id: "1", role: "super_admin" }, x)) },
    { name: "GET admin/subscription", call: x => subscriptionRoute.GET(get("http://x/api/admin/subscription?code=TESTE_A", x)) },
    { name: "POST admin/subscription", call: x => subscriptionRoute.POST(send("POST", "http://x/api/admin/subscription", { code: "TESTE_A", plan: "starter" }, x)) },
    { name: "DELETE admin/subscription", call: x => subscriptionRoute.DELETE(send("DELETE", "http://x/api/admin/subscription", { code: "TESTE_A" }, x)) },
    { name: "POST finance/close-month", call: x => closeMonthRoute.POST(send("POST", "http://x/api/finance/close-month", { year: 2026, month: 9 }, x)) },
  ]

  for (const tc of superAdminOnly) {
    it(`${tc.name}: cabeçalho x-admin-secret certo → 401, sem banco e sem Asaas`, async () => {
      const res = await tc.call(h)
      expect(res.status).toBe(401)
      expect(queryMock).not.toHaveBeenCalled()
      expect(asaasLib.createSubscription).not.toHaveBeenCalled()
      expect(asaasLib.cancelSubscription).not.toHaveBeenCalled()
    })

    it(`${tc.name}: sessão de operador → 401`, async () => {
      sessionMock.mockResolvedValue({ user: { email: "op@teste", role: "operador" } })
      const res = await tc.call({})
      expect(res.status).toBe(401)
      expect(queryMock).not.toHaveBeenCalled()
    })
  }

  it("sessão de super_admin continua passando (GET admin/users)", async () => {
    sessionMock.mockResolvedValue({ user: { email: "admin@teste", role: "super_admin" } })
    const res = await usersRoute.GET(get("http://x/api/admin/users", {}))
    expect(res.status).toBe(200)
  })

  it("finance/asaas é a única que aceita o cabeçalho; operador sem cabeçalho → 401", async () => {
    expect((await asaasRoute.GET(get("http://x/api/finance/asaas", h))).status).toBe(400) // passou da autenticação
    sessionMock.mockResolvedValue({ user: { email: "op@teste", role: "operador" } })
    expect((await asaasRoute.GET(get("http://x/api/finance/asaas", {}))).status).toBe(401)
    sessionMock.mockResolvedValue({ user: { email: "admin@teste", role: "super_admin" } })
    expect((await asaasRoute.GET(get("http://x/api/finance/asaas", {}))).status).toBe(400)
  })
})

describe("varredura do código: só o login de admin cria sessão NextAuth", () => {
  const root = process.cwd()
  const read = (rel: string) => fs.readFileSync(path.join(root, rel), "utf8")
  const SKIP = new Set(["node_modules", ".next", "dist", ".git"])
  function walk(dir: string, out: string[] = []): string[] {
    if (!fs.existsSync(dir)) return out
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (SKIP.has(e.name)) continue
      const p = path.join(dir, e.name)
      if (e.isDirectory()) walk(p, out)
      else if (/\.(ts|tsx|js)$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)) out.push(p)
    }
    return out
  }
  const rel = (p: string) => path.relative(root, p).replace(/\\/g, "/")
  const sources = ["app", "lib", "src", "components", "packages"].flatMap(d => walk(path.join(root, d)))
  const withoutComments = (s: string) => s.replace(/^\s*(\/\/|\*|\/\*).*$/gm, "")

  it("lib/auth-options.ts tem um único provedor: credenciais (email e senha de admin)", () => {
    const src = withoutComments(read("lib/auth-options.ts"))
    const providerImports = [...src.matchAll(/from\s+["']next-auth\/providers\/([\w-]+)["']/g)].map(m => m[1])
    expect(providerImports).toEqual(["credentials"])
    expect([...src.matchAll(/\b\w*Provider\s*\(/g)].map(m => m[0].replace(/\s*\($/, ""))).toEqual(["CredentialsProvider"])
    // O authorize só devolve usuário vindo do admin mestre (env) ou de admin_users.
    expect([...src.matchAll(/\bFROM\s+(\w+)/gi)].map(m => m[1])).toEqual(["admin_users"])
  })

  it("nenhum outro arquivo declara provedores do NextAuth nem monta o handler", () => {
    const offenders = sources.filter(p => {
      const s = withoutComments(fs.readFileSync(p, "utf8"))
      return /next-auth\/providers\//.test(s) || /\bNextAuth\s*\(/.test(s)
    }).map(rel).sort()
    expect(offenders).toEqual(["app/api/auth/[...nextauth]/route.ts", "lib/auth-options.ts"])
  })

  it("ninguém fabrica JWT do NextAuth à mão (next-auth/jwt)", () => {
    const offenders = sources.filter(p => /next-auth\/jwt/.test(withoutComments(fs.readFileSync(p, "utf8")))).map(rel)
    expect(offenders).toEqual([])
  })

  it("signIn só é chamado na tela de login do admin", () => {
    const offenders = sources.filter(p => /\bsignIn\s*\(/.test(withoutComments(fs.readFileSync(p, "utf8")))).map(rel).sort()
    expect(offenders).toEqual(["app/admin/login/page.tsx"])
  })

  it("as rotas de login de cliente e anunciante (app/api/auth/otp) não importam next-auth", () => {
    const otp = walk(path.join(root, "app/api/auth/otp"))
    expect(otp.length).toBeGreaterThan(0)
    const offenders = otp.filter(p => /["']next-auth/.test(fs.readFileSync(p, "utf8"))).map(rel)
    expect(offenders).toEqual([])
  })
})
