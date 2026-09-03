// reports/buildDashboardReportHtml.ts
// Fase 47 (03/09/2026): substitui reports/DashboardReport.tsx (JSX +
// @react-pdf/renderer) como fonte do HTML usado por
// app/api/reports/generate/route.ts -- @react-pdf/renderer quebra dentro
// deste servidor Next.js 15 com "Minified React error #31" (confirmado:
// não depende da versão da lib -- 4.5.1, 4.9.0 e 3.4.5 falham igual, só
// dentro do processo do Next; fora dele funciona normalmente). Puppeteer
// HTML->PDF testado e funcionando de ponta a ponta no mesmo processo.
//
// Mesmo padrão de template HTML já usado em lib/publishMedia.ts
// (buildHtml): função pura, string template literal, CSS inline,
// <!DOCTYPE html> autocontido, sem asset externo.
//
// reports/DashboardReport.tsx NÃO foi removido -- app/api/reports/
// dashboard/route.ts (rota separada, hardcoded/scaffold, fora do escopo
// desta mudança) ainda importa o componente React diretamente.

export type DashboardReportKpis = {
  total_executions: number
  active_players: number
  total_seconds: number
  active_campaigns: number
}

export type DashboardReportParams = {
  start: string
  end: string
  kpis?: DashboardReportKpis
  integrityHash?: string
  signedAt?: string
}

// Mesmo default seguro do componente original -- nunca quebra o PDF.
const EMPTY_KPIS: DashboardReportKpis = {
  total_executions: 0,
  active_players: 0,
  total_seconds: 0,
  active_campaigns: 0,
}

// Mesma lógica de quebra de hash do componente original.
function splitHash(hash: string, size = 32): string[] {
  const parts: string[] = []
  for (let i = 0; i < hash.length; i += size) parts.push(hash.slice(i, i + size))
  return parts
}

export function buildDashboardReportHtml(params: DashboardReportParams): string {
  const { start, end, integrityHash, signedAt } = params
  const kpis = params.kpis ?? EMPTY_KPIS
  const signedAtLabel = signedAt ? new Date(signedAt).toLocaleString("pt-BR") : undefined

  const footerHtml = integrityHash
    ? `
  <div class="footer">
    <div class="footer-line">Documento assinado digitalmente</div>
    ${signedAtLabel ? `<div class="footer-line">Assinado em: ${signedAtLabel}</div>` : ""}
    <div class="hash-label">Hash de integridade (SHA-256):</div>
    ${splitHash(integrityHash).map(line => `<div class="hash-line">${line}</div>`).join("")}
  </div>`
    : ""

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 10px;
    color: #111;
    padding: 40px;
  }
  .title { font-size: 18px; margin-bottom: 20px; }
  .row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }
  .card {
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 8px;
    width: 48%;
  }
  .footer {
    margin-top: 60px;
    border-top: 1px solid #ccc;
    padding-top: 6px;
  }
  .footer-line { font-size: 8px; }
  .hash-label { font-size: 7px; margin-top: 4px; }
  .hash-line { font-size: 7px; letter-spacing: 0.3px; font-family: monospace; }
</style>
</head>
<body>
  <div class="title">Relatório de Campanhas DOOHPLAY</div>
  <div>Período: ${start} – ${end}</div>

  <div class="row" style="margin-top: 16px">
    <div class="card">
      <div>Execuções</div>
      <div>${kpis.total_executions}</div>
    </div>
    <div class="card">
      <div>Players Ativos</div>
      <div>${kpis.active_players}</div>
    </div>
  </div>

  <div class="row">
    <div class="card">
      <div>Tempo Veiculado</div>
      <div>${Math.round(kpis.total_seconds / 60)} min</div>
    </div>
    <div class="card">
      <div>Campanhas Ativas</div>
      <div>${kpis.active_campaigns}</div>
    </div>
  </div>

  <div style="margin-top: 30px">Relatório gerado automaticamente pelo DOOHPLAY</div>
  ${footerHtml}
</body>
</html>`
}
