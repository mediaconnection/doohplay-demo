import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

const queryMock = vi.fn()

vi.mock("@/lib/db", () => ({
  getPool: () => ({ query: queryMock }),
}))

vi.mock("@/lib/whatsapp", () => ({
  sendWhatsApp: vi.fn().mockResolvedValue(true),
}))

import { POST } from "./route"
import { sendWhatsApp } from "@/lib/whatsapp"

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
    vi.mocked(sendWhatsApp).mockResolvedValueOnce(true)
    queryMock
      .mockResolvedValueOnce({ rows: [{ code: "BARBE332", phone: "11944450000" }] }) // cliente
      .mockResolvedValueOnce({ rows: [] })                                          // sem envio recente
      .mockResolvedValueOnce({ rows: [{ id: "otp-1" }] })                           // INSERT ... RETURNING id

    const res = await POST(makeRequest({ code: "BARBE332" }))
    expect(res.status).toBe(200)
    expect((await res.json()).ok).toBe(true)
    expect(queryMock.mock.calls.some(c => String(c[0]).includes("DELETE FROM client_login_codes"))).toBe(false)
  })

  it("devolve 503 com delivery=failed e descarta o código quando o WhatsApp falha", async () => {
    vi.mocked(sendWhatsApp).mockResolvedValueOnce(false)
    queryMock
      .mockResolvedValueOnce({ rows: [{ code: "BARBE332", phone: "11944450000" }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: "otp-2" }] })
      .mockResolvedValueOnce({ rows: [] }) // DELETE

    const res = await POST(makeRequest({ code: "BARBE332" }))
    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body.delivery).toBe("failed")
    expect(body.error).toMatch(/email/i)
    const del = queryMock.mock.calls.find(c => String(c[0]).includes("DELETE FROM client_login_codes"))
    expect(del?.[1]).toEqual(["otp-2"])
  })

  it("devolve 500 quando o banco falha, sem quebrar o processo", async () => {
    queryMock.mockRejectedValue(new Error("connection refused"))

    const res = await POST(makeRequest({ code: "LEMEL186" }))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBeTruthy()
  })
})
