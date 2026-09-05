import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest"
import { NextRequest } from "next/server"
import { hashPassword } from "@/lib/password"

beforeAll(() => {
  process.env.CLIENT_SESSION_SECRET = "segredo-de-teste-nao-usar-em-producao"
})

const queryMock = vi.fn()

vi.mock("@/lib/db", () => ({
  getPool: () => ({ query: queryMock }),
}))

import { POST } from "./route"

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/client/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  })
}

function futureDate(minutes: number) {
  return new Date(Date.now() + minutes * 60_000).toISOString()
}

describe("POST /api/client/auth/verify-otp", () => {
  beforeEach(() => {
    queryMock.mockReset()
  })

  it("aceita o código correto, marca como usado e seta o cookie de sessão", async () => {
    const otpHash = hashPassword("123456")
    queryMock
      .mockResolvedValueOnce({ rows: [{ id: 1, otp_hash: otpHash, expires_at: futureDate(10), used: false, attempts: 0 }] })
      .mockResolvedValueOnce({ rows: [] }) // UPDATE used = true

    const res = await POST(makeRequest({ code: "LEMEL186", otp: "123456" }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)

    const cookie = res.cookies.get("doohplay_client_session")
    expect(cookie?.value).toBeTruthy()

    // A 2ª chamada de query deve ser o UPDATE marcando o código como usado.
    expect(queryMock.mock.calls[1][0]).toMatch(/UPDATE client_login_codes SET used = true/)
  })

  it("rejeita código incorreto e incrementa attempts", async () => {
    const otpHash = hashPassword("123456")
    queryMock
      .mockResolvedValueOnce({ rows: [{ id: 1, otp_hash: otpHash, expires_at: futureDate(10), used: false, attempts: 0 }] })
      .mockResolvedValueOnce({ rows: [] }) // UPDATE attempts + 1

    const res = await POST(makeRequest({ code: "LEMEL186", otp: "000000" }))
    expect(res.status).toBe(401)
    expect(queryMock.mock.calls[1][0]).toMatch(/UPDATE client_login_codes SET attempts = attempts \+ 1/)
  })

  it("rejeita código expirado", async () => {
    const otpHash = hashPassword("123456")
    queryMock.mockResolvedValueOnce({ rows: [{ id: 1, otp_hash: otpHash, expires_at: futureDate(-1), used: false, attempts: 0 }] })

    const res = await POST(makeRequest({ code: "LEMEL186", otp: "123456" }))
    expect(res.status).toBe(401)
  })

  it("rejeita código já usado", async () => {
    const otpHash = hashPassword("123456")
    queryMock.mockResolvedValueOnce({ rows: [{ id: 1, otp_hash: otpHash, expires_at: futureDate(10), used: true, attempts: 0 }] })

    const res = await POST(makeRequest({ code: "LEMEL186", otp: "123456" }))
    expect(res.status).toBe(401)
  })

  it("rejeita depois de atingir o limite de tentativas, mesmo com o OTP certo", async () => {
    const otpHash = hashPassword("123456")
    queryMock.mockResolvedValueOnce({ rows: [{ id: 1, otp_hash: otpHash, expires_at: futureDate(10), used: false, attempts: 5 }] })

    const res = await POST(makeRequest({ code: "LEMEL186", otp: "123456" }))
    expect(res.status).toBe(401)
    // Não deve nem chamar UPDATE nenhum -- barrado antes de checar a senha.
    expect(queryMock).toHaveBeenCalledTimes(1)
  })

  it("devolve 400 quando código ou otp não são informados", async () => {
    const res = await POST(makeRequest({ code: "LEMEL186", otp: "" }))
    expect(res.status).toBe(400)
  })

  it("devolve 401 quando não existe nenhum código pendente pra esse cliente", async () => {
    queryMock.mockResolvedValueOnce({ rows: [] })
    const res = await POST(makeRequest({ code: "LEMEL186", otp: "123456" }))
    expect(res.status).toBe(401)
  })
})
