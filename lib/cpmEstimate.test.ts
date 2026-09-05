import { describe, it, expect } from "vitest"
import { cpmEstimateValue, cpmEstimateLabel, estimatedAdvertiserRevenue } from "./cpmEstimate"

describe("cpmEstimateValue", () => {
  it("usa a faixa mais alta (R$ 8) acima de 500 plays", () => {
    expect(cpmEstimateValue(501)).toBe(8)
    expect(cpmEstimateValue(10000)).toBe(8)
  })

  it("usa R$ 12 entre 201 e 500 plays", () => {
    expect(cpmEstimateValue(500)).toBe(12)
    expect(cpmEstimateValue(201)).toBe(12)
  })

  // O corte é > (estritamente maior), não >=: no limite exato da faixa
  // (200, 50, 0) o valor ainda cai na faixa de baixo, mais cara.
  it("plays exatamente no limite da faixa caem na faixa de baixo (corte é > , não >=)", () => {
    expect(cpmEstimateValue(200)).toBe(15)
    expect(cpmEstimateValue(50)).toBe(18)
    expect(cpmEstimateValue(0)).toBe(18)
  })

  it("nunca retorna abaixo de R$ 8 nem acima de R$ 18", () => {
    expect(cpmEstimateValue(1_000_000)).toBe(8)
    expect(cpmEstimateValue(-5)).toBe(18)
  })
})

describe("cpmEstimateLabel", () => {
  it("formata em real com vírgula decimal", () => {
    expect(cpmEstimateLabel(501)).toBe("R$ 8,00")
    expect(cpmEstimateLabel(0)).toBe("R$ 18,00")
  })
})

describe("estimatedAdvertiserRevenue", () => {
  it("retorna 0 quando não há exibições", () => {
    expect(estimatedAdvertiserRevenue(0)).toBe(0)
    expect(estimatedAdvertiserRevenue(-10)).toBe(0)
  })

  it("calcula CPM x milheiro de exibições reais, arredondado", () => {
    // 600 plays -> tier de R$ 8 -> 600/1000 * 8 = 4.8 -> arredonda pra 5
    expect(estimatedAdvertiserRevenue(600)).toBe(5)
    // 100 plays -> tier de R$ 15 -> 100/1000 * 15 = 1.5 -> arredonda pra 2
    expect(estimatedAdvertiserRevenue(100)).toBe(2)
  })
})
