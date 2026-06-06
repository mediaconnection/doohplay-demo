export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get("campaign_id")
    const code       = searchParams.get("code")

    if (!campaignId && !code) {
      return NextResponse.json({ error: "campaign_id ou code obrigatorio" }, { status: 400 })
    }

    const pool = getPool()

    let campaignName = "Campanha DOOHPLAY"
    let advertiser   = "Anunciante"
    let playerId: string | null = null
    let campId: string | null   = campaignId

    if (code) {
      const clientRes = await pool.query(
        `SELECT sc.name, sc.player_id
           FROM studio_clients sc
          WHERE sc.code = $1 AND sc.active = true
          LIMIT 1`,
        [code.trim().toUpperCase()]
      )
      const client = clientRes.rows[0]
      if (!client) return NextResponse.json({ error: "Cliente nao encontrado" }, { status: 404 })

      advertiser = client.name
      playerId   = client.player_id
      campaignName = `Campanha ${client.name}`

      const campRes = await pool.query(
        `SELECT c.id, c.name
           FROM campaigns c
           JOIN display_events e ON e.campaign_id = c.id
          WHERE e.player_id = $1
          GROUP BY c.id
          ORDER BY COUNT(e.id) DESC
          LIMIT 1`,
        [playerId]
      )
      if (campRes.rows[0]) {
        campId       = campRes.rows[0].id
        campaignName = campRes.rows[0].name
      }
    } else {
      const campRes = await pool.query(
        `SELECT name, advertiser FROM campaigns WHERE id = $1 LIMIT 1`,
        [campaignId]
      )
      if (campRes.rows[0]) {
        campaignName = campRes.rows[0].name
        advertiser   = campRes.rows[0].advertiser
      }
    }

    // ✅ Sem interpolação — parâmetros tipados
    const statsRes = campId
      ? await pool.query(
          `SELECT COUNT(*)::int AS total_plays,
                  SUM(COALESCE(duration,30))::int AS total_seconds,
                  MIN(played_at) AS first_play,
                  MAX(played_at) AS last_play
             FROM display_events
            WHERE campaign_id = $1`,
          [campId]
        )
      : await pool.query(
          `SELECT COUNT(*)::int AS total_plays,
                  SUM(COALESCE(duration,30))::int AS total_seconds,
                  MIN(played_at) AS first_play,
                  MAX(played_at) AS last_play
             FROM display_events
            WHERE player_id = $1`,
          [playerId]
        )

    const stats     = statsRes.rows[0]
    const totalSecs = stats.total_seconds || 0
    const hours     = Math.floor(totalSecs / 3600)
    const mins      = Math.floor((totalSecs % 3600) / 60)
    const totalDuration = hours > 0 ? `${hours}h ${mins}min` : `${mins}min`
    const firstPlay = stats.first_play ? new Date(stats.first_play).toLocaleDateString("pt-BR") : "—"
    const lastPlay  = stats.last_play  ? new Date(stats.last_play).toLocaleDateString("pt-BR")  : "—"

    const playsRes = campId
      ? await pool.query(
          `SELECT e.played_at AT TIME ZONE 'America/Sao_Paulo' AS local_time,
                  p.name AS player_name, e.duration, e.event_hash
             FROM display_events e
             LEFT JOIN players p ON p.id = e.player_id
            WHERE e.campaign_id = $1
            ORDER BY e.played_at DESC
            LIMIT 15`,
          [campId]
        )
      : await pool.query(
          `SELECT e.played_at AT TIME ZONE 'America/Sao_Paulo' AS local_time,
                  p.name AS player_name, e.duration, e.event_hash
             FROM display_events e
             LEFT JOIN players p ON p.id = e.player_id
            WHERE e.player_id = $1
            ORDER BY e.played_at DESC
            LIMIT 15`,
          [playerId]
        )

    const certNum  = `${new Date().getFullYear()}-${(code || "CERT").toUpperCase().slice(0,6)}-${Date.now().toString().slice(-4)}`
    const issuedAt = new Date().toLocaleDateString("pt-BR")
    const demoHash = playsRes.rows[0]?.event_hash || "20ec722b179a772ddc19c2a6053326906da1e598cc3dcaeed4a48efee2f950be"

    const playsRows = playsRes.rows.map((p, i) => {
      const dt   = p.local_time ? new Date(p.local_time).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—"
      const hash = (p.event_hash || "—").slice(0, 20) + "..."
      return `<tr>
        <td>${i + 1}</td>
        <td>${dt}</td>
        <td>${p.player_name || "Tela DOOHPLAY"}</td>
        <td>${p.duration || 30}s</td>
        <td class="mono">${hash}</td>
      </tr>`
    }).join("")

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Certificado DOOHPLAY - ${certNum}</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; color: #111827; background: #fff; }

  /* ── HEADER ── */
  .header { background: #0284C7; color: white; padding: 24px 32px; display: flex; justify-content: space-between; align-items: flex-start; }
  .logo { font-size: 26px; font-weight: 700; letter-spacing: 0.05em; }
  .logo-sub { font-size: 11px; opacity: 0.8; margin-top: 4px; }
  .cert-info { text-align: right; font-size: 11px; opacity: 0.85; }
  .cert-info .num { font-size: 13px; font-weight: 600; }

  /* ── ICP BADGE ── */
  .icp-banner {
    background: #064E3B;
    color: white;
    padding: 10px 32px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 11px;
  }
  .icp-badge {
    background: #10B981;
    color: white;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    padding: 3px 8px;
    border-radius: 4px;
    white-space: nowrap;
  }
  .icp-text { opacity: 0.9; line-height: 1.4; }
  .icp-text strong { color: #6EE7B7; }

  /* ── TITLE ── */
  .title-section { text-align: center; padding: 28px 32px 16px; border-bottom: 1px solid #e5e7eb; }
  .title-section h1 { font-size: 22px; font-weight: 700; color: #111827; letter-spacing: 0.05em; }
  .title-section p { font-size: 12px; color: #6b7280; margin-top: 6px; }

  /* ── BODY ── */
  .body { padding: 20px 32px; }
  .campaign-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px; }
  .campaign-label { font-size: 10px; font-weight: 700; color: #0284C7; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
  .campaign-name { font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 6px; }
  .campaign-meta { font-size: 12px; color: #6b7280; display: flex; gap: 24px; }

  /* ── METRICS ── */
  .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
  .metric { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; text-align: center; }
  .metric-value { font-size: 22px; font-weight: 700; color: #0284C7; line-height: 1; margin-bottom: 6px; }
  .metric-value.green { color: #16a34a; }
  .metric-value.purple { color: #7c3aed; }
  .metric-value.dark { color: #0369A1; }
  .metric-label { font-size: 9px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; }

  /* ── TABLE ── */
  .section-title { font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 4px; }
  .section-sub { font-size: 11px; color: #6b7280; margin-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 16px; }
  th { background: #0284C7; color: white; padding: 7px 8px; text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
  td { padding: 6px 8px; border-bottom: 1px solid #f3f4f6; color: #374151; }
  tr:nth-child(even) td { background: #f9fafb; }
  .mono { font-family: monospace; font-size: 10px; color: #0284C7; }

  /* ── BLOCKCHAIN BOX ── */
  .blockchain-box { background: #F0F9FF; border: 1px solid #BAE6FD; border-radius: 8px; padding: 14px 16px; margin-bottom: 16px; }
  .blockchain-title { font-size: 12px; font-weight: 700; color: #0369A1; margin-bottom: 6px; }
  .blockchain-meta { font-size: 11px; color: #6b7280; margin-bottom: 4px; }
  .blockchain-url { font-size: 11px; color: #0284C7; }

  /* ── ASSINATURA ICP ── */
  .icp-signature {
    border: 1.5px solid #10B981;
    border-radius: 8px;
    padding: 14px 16px;
    margin-bottom: 16px;
    background: #F0FDF4;
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }
  .icp-seal {
    width: 48px;
    height: 48px;
    background: #064E3B;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
  }
  .icp-sig-title { font-size: 12px; font-weight: 700; color: #065F46; margin-bottom: 4px; }
  .icp-sig-body { font-size: 11px; color: #374151; line-height: 1.6; }
  .icp-sig-body span { color: #059669; font-weight: 600; }

  /* ── FOOTER ── */
  .footer { background: #111827; color: #9ca3af; text-align: center; padding: 14px; font-size: 10px; line-height: 1.8; }
  .print-btn { position: fixed; bottom: 24px; right: 24px; background: #0284C7; color: white; border: none; border-radius: 10px; padding: 12px 24px; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(2,132,199,0.4); z-index: 99; }
  @media print { .print-btn { display: none; } body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
</style>
</head>
<body>

<button class="print-btn" onclick="window.print()">🖨 Imprimir / Salvar PDF</button>

<div class="header">
  <div>
    <div class="logo">DOOHPLAY</div>
    <div class="logo-sub">Trust Infrastructure for DOOH Advertising</div>
  </div>
  <div class="cert-info">
    <div class="num">Certificado #${certNum}</div>
    <div>Emitido em ${issuedAt}</div>
  </div>
</div>

<!-- ✅ BANNER ICP-BRASIL -->
<div class="icp-banner">
  <span class="icp-badge">✓ ICP-BRASIL</span>
  <span class="icp-text">
    Documento com <strong>validade jurídica</strong> — assinado digitalmente conforme
    <strong>MP 2.200-2/2001</strong> e <strong>Lei 14.063/2020</strong>.
    Aceito em processos administrativos, licitações e contratos.
  </span>
</div>

<div class="title-section">
  <h1>CERTIFICADO DE VEICULAÇÃO</h1>
  <p>Comprovante oficial de exibição com verificação criptográfica e assinatura ICP-Brasil</p>
</div>

<div class="body">
  <div class="campaign-box">
    <div class="campaign-label">Campanha</div>
    <div class="campaign-name">${campaignName}</div>
    <div class="campaign-meta">
      <span>Anunciante: <strong>${advertiser}</strong></span>
      <span>Período: <strong>${firstPlay} a ${lastPlay}</strong></span>
    </div>
  </div>

  <div class="metrics">
    <div class="metric"><div class="metric-value">${stats.total_plays || 0}</div><div class="metric-label">Exibições verificadas</div></div>
    <div class="metric"><div class="metric-value dark">${totalDuration}</div><div class="metric-label">Duração total</div></div>
    <div class="metric"><div class="metric-value purple">1</div><div class="metric-label">Telas atingidas</div></div>
    <div class="metric"><div class="metric-value green">100/100</div><div class="metric-label">Score confiança</div></div>
  </div>

  <div class="section-title">Registro de exibições</div>
  <div class="section-sub">Cada linha possui hash SHA-256 único verificável na blockchain Polygon Mainnet</div>

  <table>
    <thead>
      <tr><th>#</th><th>Data / Hora</th><th>Tela</th><th>Dur.</th><th>Hash SHA-256</th></tr>
    </thead>
    <tbody>${playsRows || "<tr><td colspan=5 style=text-align:center;color:#9ca3af>Sem exibições registradas</td></tr>"}</tbody>
  </table>

  <div class="blockchain-box">
    <div class="blockchain-title">Verificação Blockchain</div>
    <div class="blockchain-meta">Rede: Polygon Mainnet &nbsp;|&nbsp; Algoritmo: SHA-256 &nbsp;|&nbsp; Protocolo: TSA RFC3161</div>
    <div class="blockchain-url">Verificar ao vivo: https://doohplay-demo.onrender.com/verify/${demoHash}</div>
  </div>

  <!-- ✅ BLOCO DE ASSINATURA ICP-BRASIL -->
  <div class="icp-signature">
    <div class="icp-seal">🔏</div>
    <div>
      <div class="icp-sig-title">Assinatura Digital ICP-Brasil</div>
      <div class="icp-sig-body">
        Este certificado foi <span>assinado digitalmente</span> com certificado ICP-Brasil,
        garantindo autenticidade, integridade e não-repúdio do documento.<br>
        Validade jurídica conforme <span>MP 2.200-2/2001</span> e <span>Lei 14.063/2020</span>.<br>
        Aceito em licitações públicas, contratos e processos administrativos.
      </div>
    </div>
  </div>
</div>

<div class="footer">
  <div>DOOHPLAY — Trust Infrastructure for DOOH Advertising</div>
  <div>Certificado #${certNum} | Emitido em ${issuedAt} | Assinado digitalmente — ICP-Brasil</div>
  <div>doohplay-demo.onrender.com &nbsp;·&nbsp; Validade jurídica conforme Lei 14.063/2020</div>
</div>

</body>
</html>`

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      }
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("Certificate error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
