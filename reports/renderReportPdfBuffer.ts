// reports/renderReportPdfBuffer.ts
// Fase 47 (03/09/2026): renderiza HTML -> PDF via Puppeteer, substituindo
// @react-pdf/renderer em app/api/reports/generate/route.ts (ver
// buildDashboardReportHtml.ts pro motivo completo). Mesmo check de
// instalação do Chrome já usado em lib/publishMedia.ts
// (renderImageAndUpload) -- crítico em produção (Render), onde o cache
// do Chrome do Puppeteer não persiste entre deploys.
//
// Limite conhecido, testado nesta investigação: a saída do Puppeteer NÃO
// é byte-determinística (mesmo HTML gera hashes SHA-256 diferentes a cada
// chamada, provavelmente por /CreationDate do Chrome) -- mesma
// característica que @react-pdf/renderer/pdfkit também têm por padrão,
// não é regressão desta troca. A rota atual nunca persiste nem devolve os
// bytes do PDF, só o hash de UMA geração -- sem risco prático hoje. Se um
// dia existir "baixar o PDF certificado", tem que cachear os bytes exatos
// gerados na certificação, nunca regenerar sob demanda.
import puppeteer from "puppeteer"

export async function renderReportPdfBuffer(html: string): Promise<Buffer> {
  const { executablePath } = await import("puppeteer")
  const fs = await import("fs")
  const chromePath = (() => { try { return executablePath() } catch { return null } })()
  if (!chromePath || !fs.existsSync(chromePath)) {
    const { spawnSync } = await import("child_process")
    const result = spawnSync("npx", ["puppeteer", "browsers", "install", "chrome"], {
      stdio: "inherit", shell: true, cwd: "/opt/render/project/src",
    })
    if (result.status !== 0) throw new Error("Falha ao instalar Chrome: " + result.stderr)
  }

  const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] })
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: "networkidle0" })
    const pdf = await page.pdf({ format: "A4", printBackground: true })
    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}
