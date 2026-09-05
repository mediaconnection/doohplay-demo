import { describe, it, expect } from "vitest"
import { sha256FromObject } from "./hash"

describe("sha256FromObject", () => {
  it("é determinístico para o mesmo objeto", () => {
    const obj = { b: 2, a: 1, c: { z: 1, y: 2 } }
    expect(sha256FromObject(obj)).toBe(sha256FromObject(obj))
  })

  // Propriedade que sustenta todo o pipeline de certificação: o hash não
  // pode depender da ordem em que as chaves foram inseridas no objeto,
  // senão o mesmo relatório lógico gera hashes diferentes dependendo de
  // como o objeto foi construído em cada lugar do código.
  it("é independente da ordem das chaves (canonicalização)", () => {
    const emOrdemA = { name: "loja", total: 10, nested: { x: 1, y: 2 } }
    const emOrdemB = { nested: { y: 2, x: 1 }, total: 10, name: "loja" }
    expect(sha256FromObject(emOrdemA)).toBe(sha256FromObject(emOrdemB))
  })

  it("produz hashes diferentes para conteúdos diferentes", () => {
    expect(sha256FromObject({ a: 1 })).not.toBe(sha256FromObject({ a: 2 }))
  })

  it("retorna um hex de 64 caracteres (SHA-256)", () => {
    const hash = sha256FromObject({ a: 1 })
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })
})
