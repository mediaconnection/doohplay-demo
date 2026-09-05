// lib/guidedTemplates.test.ts
// Fase 46+ (2026-09-05): primeiros testes automatizados reais do projeto
// via Vitest. Cobre especificamente as duas regras achadas com bug real
// nesta sessão -- campo condicional do Horário/Feriado (spec 2.3) e o
// prompt/preview montados a partir dos campos guiados.
import { describe, it, expect } from "vitest"
import {
  GUIDED_TEMPLATES,
  getGuidedTemplate,
  validateGuidedValues,
  buildGuidedPrompt,
  buildGuidedPreviewCopy,
} from "@/lib/guidedTemplates"

describe("getGuidedTemplate", () => {
  it("retorna o template certo pelo id", () => {
    expect(getGuidedTemplate("promocao")?.name).toBe("Promoção / Desconto")
    expect(getGuidedTemplate("horario")?.name).toBe("Horário / Feriado")
  })

  it("retorna undefined pra id desconhecido", () => {
    expect(getGuidedTemplate("nao-existe")).toBeUndefined()
    expect(getGuidedTemplate(null)).toBeUndefined()
    expect(getGuidedTemplate(undefined)).toBeUndefined()
  })
})

describe("GUIDED_TEMPLATES — estrutura", () => {
  it("tem exatamente 6 templates", () => {
    expect(GUIDED_TEMPLATES).toHaveLength(6)
  })

  it("todo template tem entre 2 e 4 campos", () => {
    for (const tpl of GUIDED_TEMPLATES) {
      expect(tpl.fields.length).toBeGreaterThanOrEqual(2)
      expect(tpl.fields.length).toBeLessThanOrEqual(4)
    }
  })

  it("só Horário/Feriado tem campo do tipo select ou requiredIf", () => {
    for (const tpl of GUIDED_TEMPLATES) {
      const hasSelect = tpl.fields.some(f => f.type === "select")
      const hasConditional = tpl.fields.some(f => f.requiredIf)
      if (tpl.id === "horario") {
        expect(hasSelect).toBe(true)
        expect(hasConditional).toBe(true)
      } else {
        expect(hasSelect).toBe(false)
        expect(hasConditional).toBe(false)
      }
    }
  })
})

describe("validateGuidedValues", () => {
  it("template desconhecido retorna ['template']", () => {
    expect(validateGuidedValues("nao-existe", {})).toEqual(["template"])
  })

  it("promocao: acusa os 2 campos obrigatórios vazios, ignora os opcionais", () => {
    const missing = validateGuidedValues("promocao", {})
    expect(missing).toContain("produto")
    expect(missing).toContain("desconto")
    expect(missing).not.toContain("validade")
    expect(missing).not.toContain("condicao")
  })

  it("promocao: válido com só os obrigatórios preenchidos", () => {
    expect(validateGuidedValues("promocao", { produto: "Corte", desconto: "20% OFF" })).toEqual([])
  })

  // Regressão direta do bug achado nesta sessão (spec 2.3): "Detalhe do
  // horário" só é obrigatório quando "Tipo de aviso" === "especial".
  describe("horario — campo condicional (spec 2.3)", () => {
    it("tipo_aviso 'normal' sem detalhe: válido", () => {
      const missing = validateGuidedValues("horario", { tipo_aviso: "normal", periodo: "25 de dezembro" })
      expect(missing).toEqual([])
    })

    it("tipo_aviso 'fechado' sem detalhe: válido", () => {
      const missing = validateGuidedValues("horario", { tipo_aviso: "fechado", periodo: "25 de dezembro" })
      expect(missing).toEqual([])
    })

    it("tipo_aviso 'especial' SEM detalhe: bloqueia (detalhe vira obrigatório)", () => {
      const missing = validateGuidedValues("horario", { tipo_aviso: "especial", periodo: "25 de dezembro" })
      expect(missing).toContain("detalhe")
    })

    it("tipo_aviso 'especial' COM detalhe: válido", () => {
      const missing = validateGuidedValues("horario", {
        tipo_aviso: "especial", periodo: "25 de dezembro", detalhe: "abrimos às 14h",
      })
      expect(missing).toEqual([])
    })

    it("sem tipo_aviso nenhum: acusa tipo_aviso e periodo, não detalhe (condição não bate)", () => {
      const missing = validateGuidedValues("horario", {})
      expect(missing).toContain("tipo_aviso")
      expect(missing).toContain("periodo")
      expect(missing).not.toContain("detalhe")
    })
  })
})

describe("buildGuidedPrompt", () => {
  it("promocao: inclui produto e desconto, condicionais só se preenchidos", () => {
    const p1 = buildGuidedPrompt("promocao", { produto: "Corte + Barba", desconto: "20% OFF" })
    expect(p1).toContain("Corte + Barba")
    expect(p1).toContain("20% OFF")
    expect(p1).not.toContain("Válido até")

    const p2 = buildGuidedPrompt("promocao", { produto: "Corte", desconto: "20% OFF", validade: "sexta-feira" })
    expect(p2).toContain("Válido até sexta-feira")
  })

  it("horario: reflete o label do tipo de aviso selecionado, não o value interno", () => {
    const p = buildGuidedPrompt("horario", { tipo_aviso: "especial", periodo: "25 de dezembro", detalhe: "abrimos às 14h" })
    expect(p).toContain("Horário especial")
    expect(p).toContain("abrimos às 14h")
    expect(p).not.toContain("especial:") // não deve vazar o value cru sem o label
  })

  it("horario: 'normal' não inclui detalhe mesmo se por engano vier preenchido", () => {
    const p = buildGuidedPrompt("horario", { tipo_aviso: "normal", periodo: "hoje", detalhe: "não deveria aparecer" })
    expect(p).not.toContain("não deveria aparecer")
  })

  it("template desconhecido retorna string vazia, não lança erro", () => {
    expect(buildGuidedPrompt("nao-existe", {})).toBe("")
  })
})

describe("buildGuidedPreviewCopy", () => {
  it("promocao: headline prioriza desconto sobre produto", () => {
    const copy = buildGuidedPreviewCopy("promocao", { produto: "Corte", desconto: "20% OFF" })
    expect(copy.headline).toBe("20% OFF")
    expect(copy.subline).toContain("Corte")
  })

  it("promocao: sem desconto, headline cai pro produto (fallback)", () => {
    const copy = buildGuidedPreviewCopy("promocao", { produto: "Corte" })
    expect(copy.headline).toBe("Corte")
  })

  it("horario: headline é o label do tipo de aviso, subline inclui detalhe só se especial", () => {
    const especial = buildGuidedPreviewCopy("horario", { tipo_aviso: "especial", periodo: "25/12", detalhe: "abrimos às 14h" })
    expect(especial.headline).toBe("Horário especial")
    expect(especial.subline).toContain("abrimos às 14h")

    const normal = buildGuidedPreviewCopy("horario", { tipo_aviso: "normal", periodo: "25/12", detalhe: "não deveria aparecer" })
    expect(normal.headline).toBe("Funcionamento normal")
    expect(normal.subline).not.toContain("não deveria aparecer")
  })

  it("institucional: cta sempre tem um default fixo", () => {
    const copy = buildGuidedPreviewCopy("institucional", { mensagem: "Tradição há 10 anos" })
    expect(copy.cta).toBe("Venha nos conhecer")
  })
})
