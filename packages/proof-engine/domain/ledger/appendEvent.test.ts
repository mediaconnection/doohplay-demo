import { describe, it, expect, vi, beforeEach } from "vitest"
import crypto from "crypto"

const queryMock = vi.fn()

vi.mock("@/lib/db", () => ({
  pool: { query: (...args: unknown[]) => queryMock(...args) },
}))

import { appendEventToLedger } from "./appendEvent"

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex")
}

describe("appendEventToLedger (fórmula canônica de hash do ledger)", () => {
  beforeEach(() => {
    queryMock.mockReset()
  })

  it("encadeia com o hash do evento anterior: event_hash = sha256(previous_event_hash + hash)", async () => {
    const prevHash = "abc123"
    const insertedRow = { id: 1, event_hash: "whatever-the-db-returns" }

    queryMock
      .mockResolvedValueOnce({ rows: [{ event_hash: prevHash }] }) // SELECT último hash
      .mockResolvedValueOnce({ rows: [insertedRow] }) // INSERT

    const result = await appendEventToLedger({
      event_id: "evt-1",
      hash: "def456",
      payload: { foo: "bar" },
    })

    const expectedHash = sha256(`${prevHash}def456`)

    expect(queryMock.mock.calls[0][0]).toMatch(/FROM event_chain/)

    const [insertSql, insertParams] = queryMock.mock.calls[1]
    expect(insertSql).toMatch(/INSERT INTO event_chain/)
    expect(insertParams).toEqual(["evt-1", expectedHash, prevHash, { foo: "bar" }])

    // A função retorna a linha real inserida (res.rows[0]), não um subconjunto.
    expect(result).toBe(insertedRow)
  })

  it("sem evento anterior, encadeia a partir de string vazia e previous_event_hash fica null", async () => {
    queryMock
      .mockResolvedValueOnce({ rows: [] }) // nenhum evento anterior
      .mockResolvedValueOnce({ rows: [{ id: 2 }] })

    await appendEventToLedger({
      event_id: "evt-2",
      hash: "onlyhash",
      payload: {},
    })

    const expectedHash = sha256("onlyhash")
    const [, insertParams] = queryMock.mock.calls[1]

    expect(insertParams[1]).toBe(expectedHash)
    expect(insertParams[2]).toBeNull()
  })
})
