import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { sendWhatsAppDetailed, sendWhatsApp } from "./whatsapp"

// 04/10/2026: o login por código só pode descartar o código quando a falha
// for CONFIRMADA pela Evolution API. Sem resposta (timeout) a mensagem pode
// ter saído e chegar atrasada — por isso os dois casos precisam ser distintos.
describe("sendWhatsAppDetailed", () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal("fetch", fetchMock)
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('"sent" quando a Evolution responde 2xx', async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 201 }))
    await expect(sendWhatsAppDetailed("11944450000", "oi")).resolves.toBe("sent")
  })

  it('"failed" quando a Evolution responde erro (falha confirmada, ex.: Connection Closed)', async () => {
    fetchMock.mockResolvedValue(new Response(
      JSON.stringify({ status: 500, response: { message: "Connection Closed" } }),
      { status: 500 },
    ))
    await expect(sendWhatsAppDetailed("11944450000", "oi")).resolves.toBe("failed")
  })

  it('"unknown" quando não há resposta em 8s (timeout)', async () => {
    vi.useFakeTimers()
    // fetch que só termina se for abortado — simula a Evolution sem responder.
    fetchMock.mockImplementation((_url: string, init: RequestInit) => new Promise((_, reject) => {
      init.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")))
    }))

    const pending = sendWhatsAppDetailed("11944450000", "oi")
    await vi.advanceTimersByTimeAsync(8000)
    await expect(pending).resolves.toBe("unknown")
  })

  it('"unknown" quando a conexão cai sem resposta (envio não confirmado)', async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"))
    await expect(sendWhatsAppDetailed("11944450000", "oi")).resolves.toBe("unknown")
  })

  it("sendWhatsApp (booleano) continua true só para envio confirmado", async () => {
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 200 }))
    await expect(sendWhatsApp("11944450000", "oi")).resolves.toBe(true)
    fetchMock.mockResolvedValueOnce(new Response("erro", { status: 500 }))
    await expect(sendWhatsApp("11944450000", "oi")).resolves.toBe(false)
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"))
    await expect(sendWhatsApp("11944450000", "oi")).resolves.toBe(false)
  })
})
