import { describe, it, expect, beforeAll, vi } from "vitest"
import { NextRequest } from "next/server"

beforeAll(() => {
  process.env.CLIENT_SESSION_SECRET = "segredo-de-teste-nao-usar-em-producao"
})

import { createClientSessionToken, CLIENT_SESSION_COOKIE } from "@/lib/client-session"
import {
  createAdvertiserSessionToken, verifyAdvertiserSessionToken, ADVERTISER_SESSION_COOKIE,
} from "@/lib/advertiser-session"
import { decideOwner, requireClientOwner, requireAdvertiserOwner } from "./requireSession"

function req(cookies: Record<string, string> = {}) {
  const cookie = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; ")
  return new NextRequest("http://localhost/x", { headers: cookie ? { cookie } : {} })
}

describe("decideOwner", () => {
  it("sem sessão → 401; outro código → 403; mesmo código → 200", () => {
    expect(decideOwner(null, "TESTE_A")).toBe(401)
    expect(decideOwner("TESTE_B", "TESTE_A")).toBe(403)
    expect(decideOwner("TESTE_A", "teste_a")).toBe(200)
    expect(decideOwner("TESTE_A", "")).toBe(403)
  })
})

describe("requireClientOwner", () => {
  it("401 sem cookie e loga a recusa", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const res = requireClientOwner(req(), "TESTE_A", "teste")
    expect(res?.status).toBe(401)
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it("403 com sessão de outro cliente", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
    const res = requireClientOwner(req({ [CLIENT_SESSION_COOKIE]: createClientSessionToken("TESTE_B") }), "TESTE_A", "teste")
    expect(res?.status).toBe(403)
  })

  it("libera o dono", () => {
    const res = requireClientOwner(req({ [CLIENT_SESSION_COOKIE]: createClientSessionToken("TESTE_A") }), "TESTE_A", "teste")
    expect(res).toBeNull()
  })

  it("401 com token adulterado", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
    const [payload, sig] = createClientSessionToken("TESTE_B").split(".")
    const forged = Buffer.from(JSON.stringify({ code: "TESTE_A", exp: Date.now() + 1e9 })).toString("base64url")
    expect(payload).not.toBe(forged)
    const res = requireClientOwner(req({ [CLIENT_SESSION_COOKIE]: `${forged}.${sig}` }), "TESTE_A", "teste")
    expect(res?.status).toBe(401)
  })
})

describe("sessão de anunciante", () => {
  it("token válido volta o código; adulterado ou de cliente não vale", async () => {
    const token = await createAdvertiserSessionToken("teste_adv")
    expect(await verifyAdvertiserSessionToken(token)).toBe("TESTE_ADV")
    expect(await verifyAdvertiserSessionToken(token.slice(0, -2) + "xx")).toBeNull()
    // Token de cliente (mesmo segredo) não pode virar sessão de anunciante...
    expect(await verifyAdvertiserSessionToken(createClientSessionToken("TESTE_ADV"))).toBeNull()
  })

  it("...nem o contrário", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
    const advToken = await createAdvertiserSessionToken("TESTE_A")
    const res = requireClientOwner(req({ [CLIENT_SESSION_COOKIE]: advToken }), "TESTE_A", "teste")
    expect(res?.status).toBe(401)
  })

  it("o cookie antigo doohplay_session (JSON sem assinatura) não autentica", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
    const legacy = encodeURIComponent(JSON.stringify({ role: "advertiser", code: "TESTE_ADV", ts: Date.now() }))
    const res = await requireAdvertiserOwner(req({ doohplay_session: legacy }), "TESTE_ADV", "teste")
    expect(res?.status).toBe(401)
  })

  it("401 sem sessão, 403 com outro anunciante, libera o dono", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
    expect((await requireAdvertiserOwner(req(), "TESTE_ADV", "teste"))?.status).toBe(401)
    const other = await createAdvertiserSessionToken("TESTE_OUTRO")
    expect((await requireAdvertiserOwner(req({ [ADVERTISER_SESSION_COOKIE]: other }), "TESTE_ADV", "teste"))?.status).toBe(403)
    const own = await createAdvertiserSessionToken("TESTE_ADV")
    expect(await requireAdvertiserOwner(req({ [ADVERTISER_SESSION_COOKIE]: own }), "TESTE_ADV", "teste")).toBeNull()
  })
})
