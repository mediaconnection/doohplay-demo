// Cada rota que envia/publica mídia tem que recusar sem sessão (401) e com
// sessão de outro cliente (403) ANTES de tocar no banco, no R2 ou na IA.
import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest"
import { NextRequest } from "next/server"

beforeAll(() => {
  process.env.CLIENT_SESSION_SECRET = "segredo-de-teste-nao-usar-em-producao"
})

const { queryMock, s3SendMock } = vi.hoisted(() => ({ queryMock: vi.fn(), s3SendMock: vi.fn() }))

vi.mock("@/lib/db", () => ({ getPool: () => ({ query: queryMock }) }))
vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class { send = s3SendMock },
  PutObjectCommand: class {}, ListObjectsV2Command: class {}, DeleteObjectCommand: class {},
}))
vi.mock("puppeteer", () => ({ default: { launch: vi.fn() }, executablePath: vi.fn() }))
vi.mock("@/lib/aiCreativeJobs", () => ({ setJobStatus: vi.fn() }))
vi.mock("@/lib/imageGeneration", () => ({ generateBackgroundImagesBatch: vi.fn() }))

import { createClientSessionToken, CLIENT_SESSION_COOKIE } from "@/lib/client-session"
import { createAdvertiserSessionToken, ADVERTISER_SESSION_COOKIE } from "@/lib/advertiser-session"
import { POST as uploadPOST, GET as uploadGET } from "@/app/api/studio/upload/route"
import { POST as publishPOST } from "@/app/api/studio/publish/route"
import { POST as aiPOST } from "@/app/api/studio/ai-generate/route"
import { POST as creativePOST } from "@/app/api/client/generate-creative/route"
import { POST as examplesPOST } from "@/app/api/client/media-examples/activate/route"
import { PATCH as playlistPATCH } from "@/app/api/client/playlist/[code]/route"
import { POST as advertiserMediaPOST } from "@/app/api/advertiser/[code]/media/route"

const TARGET = "TESTE_DONO"
const OTHER = "TESTE_OUTRO"

function jsonReq(url: string, body: unknown, cookie?: string, method = "POST") {
  return new NextRequest(url, {
    method, body: JSON.stringify(body),
    headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) },
  })
}

function formReq(url: string, fields: Record<string, string | Blob>, cookie?: string) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.append(k, v)
  return new NextRequest(url, { method: "POST", body: fd, headers: cookie ? { cookie } : {} })
}

const clientCookie = (code: string) => `${CLIENT_SESSION_COOKIE}=${createClientSessionToken(code)}`

type Case = { name: string; call: (cookie?: string) => Promise<Response> }

const cases: Case[] = [
  { name: "studio/upload POST", call: c => uploadPOST(formReq("http://x/api/studio/upload",
      { file: new File(["x"], "a.png", { type: "image/png" }), code: TARGET }, c)) },
  { name: "studio/upload GET", call: c => uploadGET(new NextRequest(`http://x/api/studio/upload?code=${TARGET}`,
      { headers: c ? { cookie: c } : {} })) },
  { name: "studio/publish POST", call: c => publishPOST(jsonReq("http://x/api/studio/publish",
      { code: TARGET, type: "youtube", asset_url: "https://youtu.be/x" }, c)) },
  { name: "studio/ai-generate POST", call: c => aiPOST(jsonReq("http://x/api/studio/ai-generate",
      { code: TARGET, prompt: "promo" }, c)) },
  { name: "generate-creative POST (JSON)", call: c => creativePOST(jsonReq("http://x/api/client/generate-creative",
      { code: TARGET, product: "corte" }, c)) },
  { name: "generate-creative POST (com foto)", call: c => creativePOST(formReq("http://x/api/client/generate-creative",
      { code: TARGET, product: "corte", photo: new File(["x"], "f.png", { type: "image/png" }) }, c)) },
  { name: "media-examples/activate POST", call: c => examplesPOST(jsonReq("http://x/api/client/media-examples/activate",
      { code: TARGET, exampleIds: ["1"] }, c)) },
  { name: "playlist PATCH", call: c => playlistPATCH(
      jsonReq(`http://x/api/client/playlist/${TARGET}`, { items: [{ id: "1", active: true }] }, c, "PATCH"),
      { params: Promise.resolve({ code: TARGET }) }) },
]

describe("rotas de envio de mídia exigem o dono logado", () => {
  beforeEach(() => {
    queryMock.mockReset()
    s3SendMock.mockReset()
    vi.spyOn(console, "warn").mockImplementation(() => {})
  })

  for (const tc of cases) {
    it(`${tc.name}: 401 sem sessão, sem tocar em banco/R2`, async () => {
      const res = await tc.call()
      expect(res.status).toBe(401)
      expect(queryMock).not.toHaveBeenCalled()
      expect(s3SendMock).not.toHaveBeenCalled()
    })

    it(`${tc.name}: 403 com sessão de outro cliente`, async () => {
      const res = await tc.call(clientCookie(OTHER))
      expect(res.status).toBe(403)
      expect(queryMock).not.toHaveBeenCalled()
      expect(s3SendMock).not.toHaveBeenCalled()
    })
  }

  it("studio/upload: o dono passa da checagem de sessão", async () => {
    queryMock.mockResolvedValueOnce({ rows: [] }) // cliente não encontrado → 404, mas já passou do 401/403
    const res = await cases[0].call(clientCookie(TARGET))
    expect(res.status).toBe(404)
  })

  it("studio/upload: erro de banco depois do R2 vira 500 (não 'ok')", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    queryMock
      .mockResolvedValueOnce({ rows: [{ id: "1", name: "Teste", phone: "", email: "" }] }) // studio_clients
      .mockResolvedValueOnce({ rows: [] })                                               // plano
      .mockResolvedValueOnce({ rows: [{ total: 0 }] })                                   // contagem
      .mockRejectedValueOnce(new Error("db caiu"))                                       // ensureCampaign
    s3SendMock.mockResolvedValueOnce({})
    const res = await cases[0].call(clientCookie(TARGET))
    expect(res.status).toBe(500)
  })
})

describe("envio de mídia do anunciante", () => {
  const url = "http://x/api/advertiser/TESTE_ADV/media"
  const body = () => ({ campaignId: "c1", files: new File(["x"], "a.png", { type: "image/png" }) })

  beforeEach(() => {
    queryMock.mockReset()
    s3SendMock.mockReset()
    vi.spyOn(console, "warn").mockImplementation(() => {})
  })

  it("401 sem sessão", async () => {
    const res = await advertiserMediaPOST(formReq(url, body()))
    expect(res.status).toBe(401)
    expect(queryMock).not.toHaveBeenCalled()
  })

  it("401 com o cookie antigo falsificável", async () => {
    const legacy = encodeURIComponent(JSON.stringify({ role: "advertiser", code: "TESTE_ADV", ts: 1 }))
    const res = await advertiserMediaPOST(formReq(url, body(), `doohplay_session=${legacy}`))
    expect(res.status).toBe(401)
  })

  it("401 com sessão de cliente (dono de tela) no lugar da de anunciante", async () => {
    const res = await advertiserMediaPOST(formReq(url, body(), clientCookie("TESTE_ADV")))
    expect(res.status).toBe(401)
  })

  it("403 com sessão de outro anunciante", async () => {
    const other = await createAdvertiserSessionToken("TESTE_OUTRO")
    const res = await advertiserMediaPOST(formReq(url, body(), `${ADVERTISER_SESSION_COOKIE}=${other}`))
    expect(res.status).toBe(403)
    expect(queryMock).not.toHaveBeenCalled()
  })

  it("o próprio anunciante passa e a mídia entra como 'pending'", async () => {
    const own = await createAdvertiserSessionToken("TESTE_ADV")
    queryMock
      .mockResolvedValueOnce({ rows: [{ id: "c1" }] }) // campanha do anunciante
      .mockResolvedValueOnce({ rows: [] })            // telas
      .mockResolvedValueOnce({ rows: [{ id: "m1" }] }) // INSERT
    s3SendMock.mockResolvedValueOnce({})
    const res = await advertiserMediaPOST(formReq(url, body(), `${ADVERTISER_SESSION_COOKIE}=${own}`))
    expect(res.status).toBe(201)
    const insertSql = String(queryMock.mock.calls[2][0])
    expect(insertSql).toContain("'pending'")
  })
})
