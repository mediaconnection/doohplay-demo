import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

const queryMock = vi.fn()

vi.mock("@/lib/db", () => ({
  getPool: () => ({ query: queryMock }),
}))

vi.mock("@/lib/whatsapp", () => ({
  sendWhatsAppDetailed: vi.fn().mockResolvedValue("sent"),
}))

import { POST } from "./route"
import { sendWhatsAppDetailed } from "@/lib/whatsapp"

const deleteCalls = () => queryMock.mock.calls.filter(c => String(c[0]).includes("DELETE FROM client_login_codes"))

// Cliente com telefone, sem envio recente, INSERT devolvendo o id do código.
function mockFreshRequest(otpId: string) {
  queryMock
    .mockResolvedValueOnce({ rows: [{ code: "BARBE332", phone: "11944450000" }] })
    .mockResolvedValueOnce({ rows: [] })
    .mockResolvedValueOnce({ rows: [{ id: otpId }] })
    .mockResolvedValueOnce({ rows: [] }) // DELETE, se houver
}

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/client/auth/request-otp", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  })
}

describe("POST /api/client/auth/request-otp", () => {
  beforeEach(() => {
    queryMock.mockReset()
  })

  // Regressão do bug real corrigido em 2026-09-05 (commit 94a3434): a
  // resposta genérica de sucesso era um NextResponse.json(...) criado uma
  // única vez como constante de módulo e reaproveitado em 3 caminhos de
  // retorno. Corpo de Response é stream de leitura única — a 1ª chamada
  // funcionava, a 2ª em diante devolvia corpo vazio (200 OK, mas
  // res.json() estourava no cliente com "Unexpected end of JSON input"),
  // causando "Erro de conexão" pra praticamente todo login real.
  it("devolve corpo legível em chamadas sucessivas, não só na primeira (cliente sem telefone cadastrado)", async () => {
    queryMock.mockResolvedValue({ rows: [] }) // studio_clients: nenhuma linha -> caminho genericOk()

    const res1 = await POST(makeRequest({ code: "LEMEL186" }))
    expect(res1.status).toBe(200)
    const body1 = await res1.json()
    expect(body1.ok).toBe(true)

    const res2 = await POST(makeRequest({ code: "LEMEL186" }))
    expect(res2.status).toBe(200)
    const body2 = await res2.json()
    expect(body2.ok).toBe(true)

    // Se a resposta fosse reaproveitada (bug antigo), seria o mesmo objeto.
    expect(res1).not.toBe(res2)
  })

  it("devolve corpo legível em chamadas sucessivas quando o cooldown de reenvio está ativo", async () => {
    queryMock
      .mockResolvedValueOnce({ rows: [{ code: "LEMEL186", phone: "5511999999999" }] })
      .mockResolvedValueOnce({ rows: [{ created_at: new Date().toISOString() }] }) // último envio agora mesmo -> cooldown ativo
      .mockResolvedValueOnce({ rows: [{ code: "LEMEL186", phone: "5511999999999" }] })
      .mockResolvedValueOnce({ rows: [{ created_at: new Date().toISOString() }] })

    const res1 = await POST(makeRequest({ code: "LEMEL186" }))
    const body1 = await res1.json()
    expect(body1.ok).toBe(true)

    const res2 = await POST(makeRequest({ code: "LEMEL186" }))
    const body2 = await res2.json()
    expect(body2.ok).toBe(true)
  })

  it("devolve 400 quando o código não é informado", async () => {
    const res = await POST(makeRequest({ code: "" }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBeTruthy()
  })

  // 04/10/2026: o envio era fire-and-forget — com a Evolution desconectada,
  // a rota respondia sucesso e a tela pedia um código que nunca chegou.
  it("responde sucesso quando o WhatsApp confirma o envio, sem descartar o código", async () => {
    vi.mocked(sendWhatsAppDetailed).mockResolvedValueOnce("sent")
    mockFreshRequest("otp-1")

    const res = await POST(makeRequest({ code: "BARBE332" }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.delivery).toBeUndefined()
    expect(deleteCalls()).toHaveLength(0)
  })

  it("falha CONFIRMADA: devolve 503 com delivery=failed e descarta o código", async () => {
    vi.mocked(sendWhatsAppDetailed).mockResolvedValueOnce("failed")
    mockFreshRequest("otp-2")

    const res = await POST(makeRequest({ code: "BARBE332" }))
    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body.delivery).toBe("failed")
    expect(body.error).toMatch(/email/i)
    expect(deleteCalls()).toHaveLength(1)
    expect(deleteCalls()[0][1]).toEqual(["otp-2"])
  })

  it("sem resposta (timeout): mantém o código válido e avisa que pode demorar", async () => {
    vi.mocked(sendWhatsAppDetailed).mockResolvedValueOnce("unknown")
    mockFreshRequest("otp-3")

    const res = await POST(makeRequest({ code: "BARBE332" }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.delivery).toBe("pending")
    expect(body.message).toMatch(/demor/i)
    expect(body.message).toMatch(/email/i)
    // Código NÃO descartado: uma mensagem que chegue atrasada continua valendo.
    expect(deleteCalls()).toHaveLength(0)
  })

  it("devolve 500 quando o banco falha, sem quebrar o processo", async () => {
    queryMock.mockRejectedValue(new Error("connection refused"))

    const res = await POST(makeRequest({ code: "LEMEL186" }))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBeTruthy()
  })
})
