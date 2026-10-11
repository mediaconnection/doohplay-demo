// CRON_SECRET sem valor padrão no código (11/10/2026): variável ausente →
// 500 com log, nunca um segredo conhecido. Nenhuma chamada real: banco e
// fetch (Evolution/WhatsApp) são simulados.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"
import fs from "fs"
import path from "path"

const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }))
vi.mock("@/lib/db", () => ({ getPool: () => ({ query: queryMock }) }))

import { GET, POST } from "@/app/api/reports/whatsapp/route"

const SECRET = "segredo-cron-de-teste"
const URL_BASE = "http://x/api/reports/whatsapp"
const post = (secret?: string) =>
  new NextRequest(URL_BASE, { method: "POST", headers: secret === undefined ? {} : { "x-cron-secret": secret } })

let fetchMock: ReturnType<typeof vi.fn>
let errorSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  queryMock.mockReset()
  queryMock.mockResolvedValue({ rows: [] })
  fetchMock = vi.fn(async () => new Response("{}", { status: 200 }))
  vi.stubGlobal("fetch", fetchMock)
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
  process.env.CRON_SECRET = SECRET
})
afterEach(() => { vi.unstubAllGlobals(); errorSpy.mockRestore() })

describe("CRON_SECRET ausente no ambiente", () => {
  for (const value of [undefined, ""]) {
    it(`POST → 500 com log, sem banco nem envio (CRON_SECRET=${JSON.stringify(value)})`, async () => {
      if (value === undefined) delete process.env.CRON_SECRET
      else process.env.CRON_SECRET = value
      for (const req of [post(), post(""), post("qualquer-coisa"), post("undefined")]) {
        const res = await POST(req)
        expect(res.status).toBe(500)
      }
      expect(errorSpy).toHaveBeenCalled()
      expect(queryMock).not.toHaveBeenCalled()
      expect(fetchMock).not.toHaveBeenCalled()
    })
  }

  it("GET → 500, com ou sem ?secret=", async () => {
    delete process.env.CRON_SECRET
    expect((await GET(new NextRequest(`${URL_BASE}?code=TESTE_A`))).status).toBe(500)
    expect((await GET(new NextRequest(`${URL_BASE}?code=TESTE_A&secret=qualquer-coisa`))).status).toBe(500)
    expect(queryMock).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe("CRON_SECRET configurada", () => {
  it("POST sem cabeçalho ou com valor errado → 401, sem banco nem envio", async () => {
    expect((await POST(post())).status).toBe(401)
    expect((await POST(post("errado"))).status).toBe(401)
    expect(queryMock).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("POST com o valor certo passa (nenhum cliente → nada enviado)", async () => {
    const res = await POST(post(SECRET))
    expect(res.status).toBe(200)
    expect((await res.json()).sent).toBe(0)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("GET com valor errado → 401; com o certo passa da autenticação", async () => {
    expect((await GET(new NextRequest(`${URL_BASE}?code=TESTE_A&secret=errado`))).status).toBe(401)
    expect((await GET(new NextRequest(`${URL_BASE}?secret=${SECRET}`))).status).toBe(400)
  })
})

describe("código-fonte", () => {
  it("não tem valor padrão para CRON_SECRET", () => {
    const src = fs.readFileSync(path.join(process.cwd(), "app/api/reports/whatsapp/route.ts"), "utf8")
    expect(src).not.toMatch(/process\.env\.CRON_SECRET\s*(\|\||\?\?)/)
  })
})
