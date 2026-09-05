// lib/studioTemplates.test.ts
// Cobre especificamente o bug real achado e corrigido nesta sessão
// (Etapa 0, commit cd44e90): business_type cadastrado em português
// (ex: "Barbearia") não batia com as chaves de STUDIO_TEMPLATES, em
// inglês -- os 2 únicos clientes reais caíam sempre no fallback
// .barber por acidente, não por decisão.
import { describe, it, expect } from "vitest"
import {
  STUDIO_TEMPLATES,
  mapBusinessTypeToTemplateSegment,
  getTemplatesForBusinessType,
  findStudioTemplate,
} from "@/lib/studioTemplates"

describe("mapBusinessTypeToTemplateSegment — regressão do bug de idioma", () => {
  it("mapeia os business_type reais (PT) confirmados em produção", () => {
    expect(mapBusinessTypeToTemplateSegment("Barbearia")).toBe("barber")
    expect(mapBusinessTypeToTemplateSegment("Lanchonete")).toBe("food")
  })

  it("é case-insensitive e tolera espaço nas pontas", () => {
    expect(mapBusinessTypeToTemplateSegment("  barbearia  ")).toBe("barber")
    expect(mapBusinessTypeToTemplateSegment("LANCHONETE")).toBe("food")
  })

  it("Restaurante e Mercado mapeiam pros segmentos certos", () => {
    expect(mapBusinessTypeToTemplateSegment("Restaurante")).toBe("food")
    expect(mapBusinessTypeToTemplateSegment("Mercado")).toBe("supermarket")
  })

  it("categorias sem template dedicado caem em 'barber' de propósito (documentado, não bug)", () => {
    expect(mapBusinessTypeToTemplateSegment("Petshop")).toBe("barber")
    expect(mapBusinessTypeToTemplateSegment("Farmácia")).toBe("barber")
    expect(mapBusinessTypeToTemplateSegment(null)).toBe("barber")
    expect(mapBusinessTypeToTemplateSegment(undefined)).toBe("barber")
    expect(mapBusinessTypeToTemplateSegment("")).toBe("barber")
  })

  it("NÃO aceita as chaves em inglês diretamente (não é isso que vem do cadastro)", () => {
    // Achado real: "barber" (inglês) não é um business_type válido vindo
    // de studio_clients -- se alguém passar isso aqui, cai no fallback
    // igual a qualquer string desconhecida (comportamento correto).
    expect(mapBusinessTypeToTemplateSegment("barber")).toBe("barber") // coincidência: cai no fallback, que também é "barber"
    expect(mapBusinessTypeToTemplateSegment("food")).toBe("barber") // NÃO deveria ser "food" -- confirma que só reconhece PT
  })
})

describe("getTemplatesForBusinessType", () => {
  it("devolve a lista certa pro segmento mapeado", () => {
    expect(getTemplatesForBusinessType("Lanchonete")).toBe(STUDIO_TEMPLATES.food)
    expect(getTemplatesForBusinessType("Barbearia")).toBe(STUDIO_TEMPLATES.barber)
  })

  it("cada segmento tem exatamente 3 templates", () => {
    for (const list of Object.values(STUDIO_TEMPLATES)) {
      expect(list).toHaveLength(3)
    }
  })
})

describe("findStudioTemplate", () => {
  it("acha o template certo pelo id dentro do segmento certo", () => {
    const tpl = findStudioTemplate("Lanchonete", "food2")
    expect(tpl.id).toBe("food2")
  })

  it("id inexistente cai no primeiro template do segmento, não quebra", () => {
    const tpl = findStudioTemplate("Lanchonete", "id-que-nao-existe")
    expect(tpl.id).toBe(STUDIO_TEMPLATES.food[0].id)
  })

  it("sem template_id nenhum, cai no primeiro do segmento", () => {
    const tpl = findStudioTemplate("Barbearia", null)
    expect(tpl.id).toBe(STUDIO_TEMPLATES.barber[0].id)
  })

  it("nunca confia em bg/accent vindos de fora -- sempre resolve contra a lista real", () => {
    const tpl = findStudioTemplate("Lanchonete", "food1")
    expect(tpl.bg).toBe(STUDIO_TEMPLATES.food[0].bg)
    expect(tpl.accent).toBe(STUDIO_TEMPLATES.food[0].accent)
  })
})
