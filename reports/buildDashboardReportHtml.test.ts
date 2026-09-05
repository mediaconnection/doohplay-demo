// reports/buildDashboardReportHtml.test.ts
// Substitui reports/DashboardReport.tsx (@react-pdf/renderer) em
// app/api/reports/generate/route.ts -- ver histórico completo no
// STATUS_PROJETO.md (Fase 47, 2026-09-03/04). Testado aqui pra proteger
// contra regressão nos defaults seguros (EMPTY_KPIS, splitHash) que já
// existiam no componente original.
import { describe, it, expect } from "vitest"
import { buildDashboardReportHtml } from "@/reports/buildDashboardReportHtml"

describe("buildDashboardReportHtml", () => {
  it("inclui título, período e os 4 KPIs no HTML", () => {
    const html = buildDashboardReportHtml({
      start: "2026-08-01",
      end: "2026-08-31",
      kpis: { total_executions: 12345, active_players: 2, total_seconds: 543210, active_campaigns: 1 },
    })
    expect(html).toContain("Relatório de Campanhas DOOHPLAY")
    expect(html).toContain("2026-08-01")
    expect(html).toContain("2026-08-31")
    expect(html).toContain("12345")
    expect(html).toContain(">2</div>") // active_players
    expect(html).toContain("1") // active_campaigns
  })

  it("converte total_seconds pra minutos arredondados", () => {
    const html = buildDashboardReportHtml({
      start: "2026-08-01", end: "2026-08-31",
      kpis: { total_executions: 0, active_players: 0, total_seconds: 543210, active_campaigns: 0 },
    })
    // 543210s / 60 = 9053.5 -> arredonda pra 9054 ou 9053 (Math.round)
    expect(html).toMatch(/905[34] min/)
  })

  it("sem kpis: usa os defaults seguros (tudo zero), nunca quebra", () => {
    const html = buildDashboardReportHtml({ start: "2026-08-01", end: "2026-08-31" })
    expect(html).toContain("0 min")
    expect(() => buildDashboardReportHtml({ start: "x", end: "y" })).not.toThrow()
  })

  it("sem integrityHash: NÃO inclui o rodapé de assinatura", () => {
    const html = buildDashboardReportHtml({ start: "2026-08-01", end: "2026-08-31" })
    expect(html).not.toContain("Documento assinado digitalmente")
    expect(html).not.toContain("Hash de integridade")
  })

  it("com integrityHash: inclui rodapé e quebra o hash em linhas de 32 caracteres", () => {
    const hash = "a".repeat(64)
    const html = buildDashboardReportHtml({ start: "2026-08-01", end: "2026-08-31", integrityHash: hash })
    expect(html).toContain("Documento assinado digitalmente")
    expect(html).toContain("Hash de integridade (SHA-256)")
    expect(html).toContain("a".repeat(32)) // cada linha tem 32 chars
  })

  it("com integrityHash e signedAt: mostra a data formatada em pt-BR", () => {
    const html = buildDashboardReportHtml({
      start: "2026-08-01", end: "2026-08-31",
      integrityHash: "b".repeat(64),
      signedAt: "2026-09-04T12:00:00.000Z",
    })
    expect(html).toContain("Assinado em:")
  })

  it("é HTML autocontido (DOCTYPE, sem asset externo)", () => {
    const html = buildDashboardReportHtml({ start: "x", end: "y" })
    expect(html.trim().startsWith("<!DOCTYPE html>")).toBe(true)
    expect(html).not.toContain("http://")
    expect(html).not.toContain("https://")
  })
})
