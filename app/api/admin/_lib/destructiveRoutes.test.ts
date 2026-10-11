// Rotas destrutivas do admin (11/10/2026): só admin logado, exclusão
// lógica, nada apagado no R2.
import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

const { queryMock, clientQueryMock, s3SendMock, sessionMock } = vi.hoisted(() => ({
  queryMock: vi.fn(), clientQueryMock: vi.fn(), s3SendMock: vi.fn(), sessionMock: vi.fn(),
}))

vi.mock("@/lib/db", () => ({
  getPool: () => ({
    query: queryMock,
    connect: async () => ({ query: clientQueryMock, release: () => {} }),
  }),
}))
vi.mock("next-auth", () => ({ getServerSession: sessionMock }))
vi.mock("@/lib/auth-options", () => ({ authOptions: {} }))
vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class { send = s3SendMock },
  ListObjectsV2Command: class { constructor(public input: unknown) {} },
  DeleteObjectCommand: class {}, DeleteObjectsCommand: class {}, PutObjectCommand: class {},
}))

import * as advertisersRoute from "@/app/api/admin/advertisers/[code]/route"
import * as r2CleanupRoute from "@/app/api/admin/r2-cleanup/[code]/route"
import * as clientsRoute from "@/app/api/admin/clients/[code]/route"
import * as institutionalRoute from "@/app/api/admin/institutional-media/[id]/route"
import * as examplesRoute from "@/app/api/admin/media-examples/[id]/route"
import { GET as playlistGET } from "@/app/api/client/playlist/[code]/route"

const admin = { user: { email: "admin@teste", role: "super_admin" } }
const ctx = (code: string) => ({ params: Promise.resolve({ code }) })
const del = (url: string) => new NextRequest(url, { method: "DELETE" })

beforeEach(() => {
  queryMock.mockReset(); clientQueryMock.mockReset(); s3SendMock.mockReset(); sessionMock.mockReset()
  vi.spyOn(console, "warn").mockImplementation(() => {})
  vi.spyOn(console, "log").mockImplementation(() => {})
})

describe("DELETE /api/admin/advertisers/[code]", () => {
  const url = "http://x/api/admin/advertisers/TESTE_ADV"

  it("401 sem sessão, sem tocar no banco", async () => {
    sessionMock.mockResolvedValue(null)
    const res = await advertisersRoute.DELETE(del(url), ctx("TESTE_ADV"))
    expect(res.status).toBe(401)
    expect(queryMock).not.toHaveBeenCalled()
  })

  it("?secret= não autentica mais", async () => {
    process.env.ADMIN_SECRET = "segredo-de-teste"
    sessionMock.mockResolvedValue(null)
    const res = await advertisersRoute.DELETE(del(url + "?secret=segredo-de-teste"), ctx("TESTE_ADV"))
    expect(res.status).toBe(401)
  })

  it("403 com sessão sem papel de admin", async () => {
    sessionMock.mockResolvedValue({ user: { email: "x@teste" } })
    const res = await advertisersRoute.DELETE(del(url), ctx("TESTE_ADV"))
    expect(res.status).toBe(403)
    expect(queryMock).not.toHaveBeenCalled()
  })

  it("409 quando o código é de um dono de tela — nada é alterado", async () => {
    sessionMock.mockResolvedValue(admin)
    queryMock
      .mockResolvedValueOnce({ rows: [{ id: "1", code: "TESTE_DONO", name: "Dono" }] }) // Advertiser
      .mockResolvedValueOnce({ rows: [{ "?column?": 1 }] })                             // studio_clients
    const res = await advertisersRoute.DELETE(del(url), ctx("TESTE_DONO"))
    expect(res.status).toBe(409)
    expect(clientQueryMock).not.toHaveBeenCalled()
    expect(s3SendMock).not.toHaveBeenCalled()
  })

  it("exclusão lógica: só UPDATE, nenhum DELETE e nada no R2", async () => {
    sessionMock.mockResolvedValue(admin)
    queryMock
      .mockResolvedValueOnce({ rows: [{ id: "1", code: "TESTE_ADV", name: "Anunciante" }] })
      .mockResolvedValueOnce({ rows: [] }) // não é dono
    clientQueryMock.mockResolvedValue({ rows: [], rowCount: 2 })
    const res = await advertisersRoute.DELETE(del(url), ctx("TESTE_ADV"))
    expect(res.status).toBe(200)
    expect((await res.json()).soft).toBe(true)

    const sqls = [...queryMock.mock.calls, ...clientQueryMock.mock.calls].map(c => String(c[0]))
    expect(sqls.some(s => /DELETE\s+FROM/i.test(s))).toBe(false)
    expect(sqls.some(s => s.includes(`UPDATE "Advertiser" SET deleted_at`))).toBe(true)
    expect(sqls.some(s => s.includes(`status = 'deleted'`))).toBe(true)
    expect(s3SendMock).not.toHaveBeenCalled()
  })
})

describe("/api/admin/r2-cleanup/[code]", () => {
  it("não existe mais DELETE (apagamento em massa removido)", () => {
    expect((r2CleanupRoute as Record<string, unknown>).DELETE).toBeUndefined()
  })

  it("GET: 401 sem sessão, mesmo com ?secret=", async () => {
    process.env.ADMIN_SECRET = "segredo-de-teste"
    sessionMock.mockResolvedValue(null)
    const res = await r2CleanupRoute.GET(
      new NextRequest("http://x/api/admin/r2-cleanup/TESTE_A?secret=segredo-de-teste"), ctx("TESTE_A"))
    expect(res.status).toBe(401)
    expect(s3SendMock).not.toHaveBeenCalled()
  })

  it("GET: lista e marca referenciado x órfão", async () => {
    sessionMock.mockResolvedValue(admin)
    s3SendMock.mockResolvedValueOnce({ Contents: [
      { Key: "studio/TESTE_A/em_uso.png", Size: 2048 },
      { Key: "studio/TESTE_A/orfao.png", Size: 1024 },
    ] })
    queryMock
      .mockResolvedValueOnce({ rows: [{ url: "https://media.exemplo/studio/TESTE_A/em_uso.png" }] })
      .mockResolvedValue({ rows: [] })
    const res = await r2CleanupRoute.GET(new NextRequest("http://x/api/admin/r2-cleanup/TESTE_A"), ctx("TESTE_A"))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.referenced).toBe(1)
    expect(body.orphans).toBe(1)
    expect(body.files.find((f: any) => f.key.endsWith("orfao.png")).referenced).toBe(false)
  })
})

// ── Segundo commit: excluir cliente, Canal (institucional) e exemplo ────────
const softCases = [
  {
    name: "DELETE /api/admin/clients/[code]",
    url: "http://x/api/admin/clients/TESTE_A",
    call: (req: NextRequest) => clientsRoute.DELETE(req, { params: Promise.resolve({ code: "TESTE_A" }) }),
    expected: "UPDATE studio_clients SET deleted_at",
  },
  {
    name: "DELETE /api/admin/institutional-media/[id]",
    url: "http://x/api/admin/institutional-media/abc",
    call: (req: NextRequest) => institutionalRoute.DELETE(req, { params: Promise.resolve({ id: "abc" }) }),
    expected: "UPDATE institutional_media SET deleted_at",
  },
  {
    name: "DELETE /api/admin/media-examples/[id]",
    url: "http://x/api/admin/media-examples/abc",
    call: (req: NextRequest) => examplesRoute.DELETE(req, { params: Promise.resolve({ id: "abc" }) }),
    expected: "UPDATE media_examples SET deleted_at",
  },
]

describe("rotas vizinhas: exclusão lógica, só admin logado", () => {
  for (const tc of softCases) {
    it(`${tc.name}: 401 sem sessão, mesmo com ?secret=`, async () => {
      process.env.ADMIN_SECRET = "segredo-de-teste"
      sessionMock.mockResolvedValue(null)
      const res = await tc.call(del(tc.url + "?secret=segredo-de-teste"))
      expect(res.status).toBe(401)
      expect(queryMock).not.toHaveBeenCalled()
    })

    it(`${tc.name}: 403 com sessão sem papel de admin`, async () => {
      sessionMock.mockResolvedValue({ user: { email: "x@teste" } })
      const res = await tc.call(del(tc.url))
      expect(res.status).toBe(403)
      expect(queryMock).not.toHaveBeenCalled()
    })

    it(`${tc.name}: só UPDATE — nenhum DELETE FROM e nada no R2`, async () => {
      sessionMock.mockResolvedValue(admin)
      queryMock.mockResolvedValue({ rows: [{ id: "abc", code: "TESTE_A", name: "Teste" }], rowCount: 1 })
      const res = await tc.call(del(tc.url))
      expect(res.status).toBe(200)
      expect((await res.json()).soft).toBe(true)
      const sqls = queryMock.mock.calls.map(c => String(c[0]))
      expect(sqls.some(s => s.includes(tc.expected))).toBe(true)
      expect(sqls.some(s => /DELETE\s+FROM/i.test(s))).toBe(false)
      expect(clientQueryMock).not.toHaveBeenCalled()
      expect(s3SendMock).not.toHaveBeenCalled()
    })

    it(`${tc.name}: 404 quando não existe ou já foi excluído`, async () => {
      sessionMock.mockResolvedValue(admin)
      queryMock.mockResolvedValue({ rows: [], rowCount: 0 })
      const res = await tc.call(del(tc.url))
      expect(res.status).toBe(404)
    })
  }

  it("excluir institucional também desliga a veiculação em placements_v2", async () => {
    sessionMock.mockResolvedValue(admin)
    queryMock.mockResolvedValue({ rows: [{ id: "abc", name: "Teste" }], rowCount: 1 })
    await institutionalRoute.DELETE(del("http://x/api/admin/institutional-media/abc"), { params: Promise.resolve({ id: "abc" }) })
    const sqls = queryMock.mock.calls.map(c => String(c[0]))
    expect(sqls.some(s => s.includes("UPDATE placements_v2 SET active = false"))).toBe(true)
  })
})

describe("GET /api/client/playlist/[code] — cliente excluído", () => {
  it("responde 200 com lista vazia, sem sessão, e não consulta mídia", async () => {
    queryMock.mockImplementation(async (sql: string) => {
      if (String(sql).includes("deleted_at IS NOT NULL")) return { rows: [{ name: "TESTE_ excluído" }] }
      return { rows: [{ name: "TESTE_ excluído", business_type: "Outro" }] }
    })
    const res = await playlistGET(new NextRequest("http://x/api/client/playlist/TESTE_A"), { params: Promise.resolve({ code: "TESTE_A" }) })
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.items).toEqual([])
    expect(body.playlist).toEqual([])
    const sqls = queryMock.mock.calls.map(c => String(c[0]))
    expect(sqls.some(s => s.includes("placements_v2"))).toBe(false)
  })
})
