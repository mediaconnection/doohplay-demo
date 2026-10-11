// Remoção do ?secret= (11/10/2026): o ADMIN_SECRET só vale no cabeçalho
// x-admin-secret, e só nas rotas que têm chamador de máquina. Query string
// e body.secret não autenticam mais em lugar nenhum.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"
import fs from "fs"
import path from "path"

const { queryMock, sessionMock } = vi.hoisted(() => ({ queryMock: vi.fn(), sessionMock: vi.fn() }))

vi.mock("@/lib/db", () => ({
  getPool: () => ({ query: queryMock, connect: async () => ({ query: queryMock, release: () => {} }) }),
}))
vi.mock("next-auth", () => ({ getServerSession: sessionMock }))
vi.mock("@/lib/auth-options", () => ({ authOptions: {} }))
vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class { send = vi.fn() },
  ListObjectsV2Command: class {}, DeleteObjectCommand: class {}, DeleteObjectsCommand: class {},
  PutObjectCommand: class {}, GetObjectCommand: class {}, HeadObjectCommand: class {},
}))
vi.mock("@/lib/asaas", () => ({
  PLANS: { starter: { name: "Starter", value: 97 } },
  getOrCreateAsaasCustomer: vi.fn(async () => ({ id: "cus_teste" })),
  createSubscription: vi.fn(async () => ({ id: "sub_teste" })),
}))

import * as fleetRoute from "@/app/api/admin/fleet/route"
import * as statsRoute from "@/app/api/admin/stats/route"
import * as screensRoute from "@/app/api/admin/screens/route"
import * as screenIdRoute from "@/app/api/admin/screens/[id]/route"
import * as playersLinkRoute from "@/app/api/admin/players/link/route"
import * as mediaIdRoute from "@/app/api/admin/media/[id]/route"
import * as networkMediaIdRoute from "@/app/api/admin/network-media/[id]/route"
import * as pricingRoute from "@/app/api/clients/[code]/pricing/route"
import * as suggestRoute from "@/app/api/admin/network-partnerships/suggest/route"
import * as institutionalRoute from "@/app/api/admin/institutional-media/route"
import * as verifyMigrationRoute from "@/app/api/admin/verify-migration/[code]/route"
import * as institutionalRecoverRoute from "@/app/api/admin/institutional-recover/route"
import * as asaasRoute from "@/app/api/finance/asaas/route"
import * as onboardingRoute from "@/app/api/onboarding/route"
import * as cadastroRoute from "@/app/api/cadastro/route"
import { hasAdminSecretHeader } from "@/lib/auth/adminSecretHeader"

const SECRET = "segredo-de-teste"
const withHeader = (v: string) => ({ "x-admin-secret": v })
const get = (url: string, headers: Record<string, string> = {}) => new NextRequest(url, { headers })
const send = (method: string, url: string, body: unknown, headers: Record<string, string> = {}) =>
  new NextRequest(url, { method, body: JSON.stringify(body), headers: { "content-type": "application/json", ...headers } })
const id = (v: string) => ({ params: Promise.resolve({ id: v }) })
const code = (v: string) => ({ params: Promise.resolve({ code: v }) })

beforeEach(() => {
  process.env.ADMIN_SECRET = SECRET
  queryMock.mockReset(); sessionMock.mockReset()
  queryMock.mockResolvedValue({ rows: [], rowCount: 0 })
  sessionMock.mockResolvedValue(null)
  for (const m of ["warn", "log", "error"] as const) vi.spyOn(console, m).mockImplementation(() => {})
})
afterEach(() => { vi.unstubAllGlobals() })

describe("hasAdminSecretHeader", () => {
  it("só aceita o valor exato no cabeçalho", () => {
    expect(hasAdminSecretHeader(get("http://x/", withHeader(SECRET)))).toBe(true)
    expect(hasAdminSecretHeader(get("http://x/", withHeader("errado")))).toBe(false)
    expect(hasAdminSecretHeader(get("http://x/"))).toBe(false)
    expect(hasAdminSecretHeader(get(`http://x/?secret=${SECRET}`))).toBe(false)
  })

  it("recusa tudo quando ADMIN_SECRET não está configurado", () => {
    delete process.env.ADMIN_SECRET
    expect(hasAdminSecretHeader(get("http://x/", withHeader("")))).toBe(false)
    expect(hasAdminSecretHeader(get("http://x/", withHeader("undefined")))).toBe(false)
  })
})

describe("rotas de painel: só sessão — ?secret=, body.secret e cabeçalho dão 401", () => {
  const cases: { name: string; call: () => Promise<Response> }[] = [
    { name: "GET admin/fleet ?secret=", call: () => fleetRoute.GET(get(`http://x/api/admin/fleet?secret=${SECRET}`)) },
    { name: "GET admin/fleet cabeçalho", call: () => fleetRoute.GET(get("http://x/api/admin/fleet", withHeader(SECRET))) },
    { name: "GET admin/stats ?secret=", call: () => statsRoute.GET(get(`http://x/api/admin/stats?secret=${SECRET}`)) },
    { name: "GET admin/screens ?secret=", call: () => screensRoute.GET(get(`http://x/api/admin/screens?secret=${SECRET}`)) },
    { name: "GET admin/players/link ?secret=", call: () => playersLinkRoute.GET(get(`http://x/api/admin/players/link?secret=${SECRET}`)) },
    { name: "DELETE admin/players/link ?secret=", call: () => playersLinkRoute.DELETE(
        new NextRequest(`http://x/api/admin/players/link?player_id=p1&secret=${SECRET}`, { method: "DELETE" })) },
    { name: "POST admin/players/link body.secret", call: () => playersLinkRoute.POST(
        send("POST", "http://x/api/admin/players/link", { secret: SECRET, player_id: "p1", code: "TESTE_A" })) },
    { name: "PATCH admin/screens/[id] body.secret", call: () => screenIdRoute.PATCH(
        send("PATCH", `http://x/api/admin/screens/s1?secret=${SECRET}`, { secret: SECRET, name: "x" }), id("s1")) },
    { name: "PATCH admin/media/[id] body.secret", call: () => mediaIdRoute.PATCH(
        send("PATCH", "http://x/api/admin/media/m1", { secret: SECRET, status: "approved" }), id("m1")) },
    { name: "PATCH admin/network-media/[id] body.secret", call: () => networkMediaIdRoute.PATCH(
        send("PATCH", "http://x/api/admin/network-media/m1", { secret: SECRET, status: "approved" }), id("m1")) },
    { name: "PATCH clients/[code]/pricing body.secret", call: () => pricingRoute.PATCH(
        send("PATCH", "http://x/api/clients/TESTE_A/pricing", { secret: SECRET, price_multiplier: 2 }), code("TESTE_A")) },
  ]
  for (const tc of cases) {
    it(`${tc.name} → 401, sem tocar no banco`, async () => {
      const res = await tc.call()
      expect(res.status).toBe(401)
      expect(queryMock).not.toHaveBeenCalled()
    })
  }

  it("sessão de admin continua passando", async () => {
    sessionMock.mockResolvedValue({ user: { email: "admin@teste", role: "super_admin" } })
    const res = await playersLinkRoute.GET(get("http://x/api/admin/players/link"))
    expect(res.status).toBe(200)
  })
})

describe("rotas com chamador de máquina: cabeçalho passa, ?secret= não", () => {
  const cases: { name: string; call: (url: string, headers?: Record<string, string>) => Promise<Response>; url: string }[] = [
    { name: "POST admin/network-partnerships/suggest", url: "http://x/api/admin/network-partnerships/suggest",
      call: (url, h) => suggestRoute.POST(send("POST", url, {}, h)) },
    { name: "GET admin/institutional-media", url: "http://x/api/admin/institutional-media",
      call: (url, h) => institutionalRoute.GET(get(url, h)) },
    { name: "GET admin/verify-migration/[code]", url: "http://x/api/admin/verify-migration/TESTE_A",
      call: (url, h) => verifyMigrationRoute.GET(get(url, h), code("TESTE_A")) },
    { name: "GET admin/institutional-recover", url: "http://x/api/admin/institutional-recover",
      call: (url, h) => institutionalRecoverRoute.GET(get(url, h)) },
    { name: "GET finance/asaas", url: "http://x/api/finance/asaas",
      call: (url, h) => asaasRoute.GET(get(url, h)) },
  ]
  for (const tc of cases) {
    it(`${tc.name}: sem nada → 401`, async () => {
      expect((await tc.call(tc.url)).status).toBe(401)
    })
    it(`${tc.name}: ?secret= certo → 401`, async () => {
      expect((await tc.call(`${tc.url}?secret=${SECRET}`)).status).toBe(401)
      expect(queryMock).not.toHaveBeenCalled()
    })
    it(`${tc.name}: cabeçalho errado → 401`, async () => {
      expect((await tc.call(tc.url, withHeader("errado"))).status).toBe(401)
    })
    it(`${tc.name}: cabeçalho certo → passa da autenticação`, async () => {
      expect((await tc.call(tc.url, withHeader(SECRET))).status).not.toBe(401)
    })
  }
})

describe("chamadores internos mandam o segredo por cabeçalho", () => {
  function stubFetch() {
    const fetchMock = vi.fn(async (_url: unknown, _init?: unknown) => new Response(JSON.stringify({ ok: true }), { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)
    return fetchMock
  }
  const callTo = (fetchMock: ReturnType<typeof stubFetch>, suffix: string) =>
    fetchMock.mock.calls.find(c => String(c[0]).split("?")[0].endsWith(suffix)) as unknown as [string, RequestInit] | undefined

  it("onboarding → POST /api/finance/asaas", async () => {
    const fetchMock = stubFetch()
    const res = await onboardingRoute.POST(send("POST", "http://x/api/onboarding", {
      business_name: "TESTE_ Loja", business_type: "Outro", address: "Rua Teste, 1", city: "Teste",
      plan: "starter", contact_name: "Teste", email: "teste@exemplo.invalid", phone: "0000000000", cpf_cnpj: "00000000000",
    }))
    expect(res.status).toBe(200)
    const call = callTo(fetchMock, "/api/finance/asaas")
    expect(call).toBeDefined()
    expect(String(call![0])).not.toContain("secret")
    expect(call![1].method).toBe("POST")
    expect((call![1].headers as Record<string, string>)["x-admin-secret"]).toBe(SECRET)
  })

  it("cadastro → POST /api/admin/network-partnerships/suggest", async () => {
    const fetchMock = stubFetch()
    const res = await cadastroRoute.POST(send("POST", "http://x/api/cadastro", {
      name: "TESTE_ Loja", business_type: "Outro", city: "Teste", phone: "0000000000",
      email: "teste@exemplo.invalid", cpf: "00000000000", plan: "starter",
    }))
    expect(res.status).toBe(200)
    const call = callTo(fetchMock, "/api/admin/network-partnerships/suggest")
    expect(call).toBeDefined()
    expect(String(call![0])).not.toContain("secret")
    expect((call![1].headers as Record<string, string>)["x-admin-secret"]).toBe(SECRET)
  })
})

describe("varredura do código: ADMIN_SECRET nunca junto de query string ou corpo", () => {
  const root = process.cwd()
  const SKIP = new Set(["node_modules", ".next", "dist", ".git"])
  function walk(dir: string, out: string[] = []): string[] {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (SKIP.has(e.name)) continue
      const p = path.join(dir, e.name)
      if (e.isDirectory()) walk(p, out)
      else if (/\.(ts|tsx|js)$/.test(e.name) && !/\.test\.ts$/.test(e.name)) out.push(p)
    }
    return out
  }
  const files = ["app", "lib", "scripts/gerar-canal-doohplay"].flatMap(d => walk(path.join(root, d)))
  const code = (p: string) => fs.readFileSync(p, "utf8").replace(/^\s*(\/\/|\*|\/\*).*$/gm, "")

  it("nenhum arquivo lê o ADMIN_SECRET de ?secret= ou body.secret", () => {
    const offenders = files.filter(p => {
      const s = code(p)
      return s.includes("ADMIN_SECRET") && /get\(\s*["']secret["']\s*\)|body\??\.secret|[?&]secret=/.test(s)
    })
    expect(offenders.map(p => path.relative(root, p))).toEqual([])
  })

  it("ADMIN_SECRET só aparece no helper e nos três chamadores", () => {
    const users = files.filter(p => code(p).includes("ADMIN_SECRET")).map(p => path.relative(root, p).replace(/\\/g, "/")).sort()
    expect(users).toEqual([
      "app/api/cadastro/route.ts",
      "app/api/onboarding/route.ts",
      "lib/auth/adminSecretHeader.ts",
      "scripts/gerar-canal-doohplay/subir-para-admin.js",
    ])
  })
})
