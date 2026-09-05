import { describe, it, expect, beforeAll } from "vitest"
import { createHmac } from "crypto"

beforeAll(() => {
  process.env.CLIENT_SESSION_SECRET = "segredo-de-teste-nao-usar-em-producao"
})

import { createClientSessionToken, verifyClientSessionToken } from "./client-session"

describe("createClientSessionToken / verifyClientSessionToken", () => {
  it("token criado é válido e devolve o código em maiúsculas", () => {
    const token = createClientSessionToken("lemel186")
    expect(verifyClientSessionToken(token)).toBe("LEMEL186")
  })

  it("rejeita token com payload adulterado", () => {
    const token = createClientSessionToken("LEMEL186")
    const [, sig] = token.split(".")
    const payloadAdulterado = Buffer.from(JSON.stringify({ code: "BARBE332", exp: Date.now() + 999999 })).toString("base64url")
    expect(verifyClientSessionToken(`${payloadAdulterado}.${sig}`)).toBeNull()
  })

  it("rejeita token com assinatura adulterada", () => {
    const token = createClientSessionToken("LEMEL186")
    const [payload] = token.split(".")
    expect(verifyClientSessionToken(`${payload}.assinatura-falsa`)).toBeNull()
  })

  it("rejeita token expirado", () => {
    const payload = Buffer.from(JSON.stringify({ code: "LEMEL186", exp: Date.now() - 1000 })).toString("base64url")
    // Precisa de uma assinatura real pro payload expirado, senão falha antes de chegar na checagem de exp.
    const sig = createHmac("sha256", process.env.CLIENT_SESSION_SECRET!).update(payload).digest("base64url")
    expect(verifyClientSessionToken(`${payload}.${sig}`)).toBeNull()
  })

  it("rejeita entradas malformadas sem lançar exceção", () => {
    expect(verifyClientSessionToken(null)).toBeNull()
    expect(verifyClientSessionToken(undefined)).toBeNull()
    expect(verifyClientSessionToken("")).toBeNull()
    expect(verifyClientSessionToken("sem-ponto-nenhum")).toBeNull()
    expect(verifyClientSessionToken("payload-invalido.assinatura")).toBeNull()
  })
})
