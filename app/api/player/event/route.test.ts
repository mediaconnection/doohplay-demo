import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

const queryMock = vi.fn()
const appendEventToLedgerMock = vi.fn()

vi.mock("@/lib/db", () => ({
  getPool: () => ({ query: (...args: unknown[]) => queryMock(...args) }),
}))

vi.mock("@proof-engine/domain/ledger/appendEvent", () => ({
  appendEventToLedger: (...args: unknown[]) => appendEventToLedgerMock(...args),
}))

import { POST } from "./route"

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/player/event", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  })
}

describe("POST /api/player/event -- contrato com o ledger (event_chain)", () => {
  beforeEach(() => {
    queryMock.mockReset()
    appendEventToLedgerMock.mockReset()
  })

  it("grava em display_events (comportamento pré-existente) e delega o ledger pro escritor canônico -- nunca com SQL próprio", async () => {
    queryMock
      .mockResolvedValueOnce({ rows: [{ player_id: "player-1" }] }) // SELECT studio_clients
      .mockResolvedValueOnce({ rows: [] }) // INSERT display_events
    appendEventToLedgerMock.mockResolvedValueOnce({ event_hash: "ledger-hash" })

    const res = await POST(
      makeRequest({
        media_id: "media-1",
        screen_code: "BARBE332",
        played_at: "2026-09-07T12:00:00.000Z",
        asset_url: "https://example.com/asset.mp4",
        duration: 10,
      })
    )

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)

    // 2ª query real é o INSERT em display_events -- a 1ª é a resolução de
    // player_id a partir do screen_code, que já existia antes desta fase.
    const [insertSql, insertParams] = queryMock.mock.calls[1]
    expect(insertSql).toMatch(/INSERT INTO display_events/)
    expect(insertParams).toEqual([
      expect.any(String), // id (randomUUID)
      "player-1",
      "media-1",
      "2026-09-07T12:00:00.000Z",
      expect.any(String), // event_hash local de display_events (base64), não o do ledger
      "https://example.com/asset.mp4",
      10,
    ])

    // Nenhuma query desta rota toca event_chain diretamente -- só o
    // escritor canônico (appendEventToLedger, mockado acima) pode.
    for (const call of queryMock.mock.calls) {
      expect(String(call[0])).not.toMatch(/event_chain/i)
    }

    expect(appendEventToLedgerMock).toHaveBeenCalledTimes(1)
    const [ledgerArg] = appendEventToLedgerMock.mock.calls[0]
    expect(ledgerArg.payload).toEqual({
      display_event_id: expect.any(String),
      player_id: "player-1",
      screen_code: "BARBE332",
      media_id: "media-1",
      played_at: "2026-09-07T12:00:00.000Z",
      duration: 10,
    })
  })

  it("melhor esforço: falha ao gravar no ledger não derruba a resposta (display_events já foi gravado)", async () => {
    queryMock
      .mockResolvedValueOnce({ rows: [{ player_id: "player-1" }] })
      .mockResolvedValueOnce({ rows: [] })
    appendEventToLedgerMock.mockRejectedValueOnce(new Error("event_chain indisponível"))

    const res = await POST(
      makeRequest({
        media_id: "media-1",
        screen_code: "BARBE332",
        played_at: "2026-09-07T12:00:00.000Z",
      })
    )

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(appendEventToLedgerMock).toHaveBeenCalledTimes(1)
  })
})
