import { describe, it, expect, vi, beforeEach } from "vitest"

const queryMock = vi.fn()
const appendEventToLedgerMock = vi.fn()

vi.mock("@/lib/db", () => ({
  pool: { query: (...args: unknown[]) => queryMock(...args) },
}))

vi.mock("@proof-engine/domain/ledger/appendEvent", () => ({
  appendEventToLedger: (...args: unknown[]) => appendEventToLedgerMock(...args),
}))

import { registerImpression } from "./registerImpression"

const IMPRESSION_ROW = {
  id: 42,
  screen_id: "screen-1",
  campaign_id: "campaign-1",
  creative_id: "creative-1",
  played_at: "2026-09-07T12:00:00.000Z",
}

describe("registerImpression -- contrato com o ledger (event_chain)", () => {
  beforeEach(() => {
    queryMock.mockReset()
    appendEventToLedgerMock.mockReset()
    queryMock.mockResolvedValue({ rows: [{ ...IMPRESSION_ROW }] })
  })

  it("grava no ledger com o payload exato que qualquer leitor futuro (trust-graph, analytics) vai assumir", async () => {
    appendEventToLedgerMock.mockResolvedValueOnce({ event_hash: "ledger-hash-abc" })

    const row = await registerImpression({
      screenId: "screen-1",
      campaignId: "campaign-1",
      creativeId: "creative-1",
      playerId: "player-1",
      deviceId: "device-1",
      playedAt: "2026-09-07T12:00:00.000Z",
    })

    expect(appendEventToLedgerMock).toHaveBeenCalledTimes(1)

    const [ledgerArg] = appendEventToLedgerMock.mock.calls[0]
    expect(Object.keys(ledgerArg.payload).sort()).toEqual(
      [
        "campaign_id",
        "creative_id",
        "device_id",
        "event_type",
        "impression_id",
        "played_at",
        "player_id",
        "screen_id",
      ].sort()
    )
    expect(ledgerArg.payload).toEqual({
      event_type: "impression",
      impression_id: "42",
      screen_id: "screen-1",
      campaign_id: "campaign-1",
      creative_id: "creative-1",
      player_id: "player-1",
      device_id: "device-1",
      played_at: "2026-09-07T12:00:00.000Z",
    })

    expect(row.event_hash).toBe("ledger-hash-abc")
  })

  it("degrada com honestidade: falha no ledger não derruba o registro da impressão (event_hash fica null)", async () => {
    appendEventToLedgerMock.mockRejectedValueOnce(new Error("ledger indisponível"))

    const row = await registerImpression({
      screenId: "screen-1",
      campaignId: "campaign-1",
      creativeId: "creative-1",
    })

    expect(row.id).toBe(42)
    expect(row.event_hash).toBeNull()
  })
})
