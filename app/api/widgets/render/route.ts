export const dynamic = "force-dynamic"
export const revalidate = 0

import { NextRequest, NextResponse } from "next/server"

const WMO: Record<number, { label: string; emoji: string }> = {
  0:  { label: "Céu limpo",       emoji: "☀️" },
  1:  { label: "Principalmente limpo", emoji: "🌤️" },
  2:  { label: "Parcialmente nublado", emoji: "⛅" },
  3:  { label: "Nublado",          emoji: "☁️" },
  45: { label: "Neblina",          emoji: "🌫️" },
  51: { label: "Garoa leve",       emoji: "🌦️" },
  61: { label: "Chuva leve",       emoji: "🌧️" },
  63: { label: "Chuva moderada",   emoji: "🌧️" },
  65: { label: "Chuva intensa",    emoji: "🌧️" },
  80: { label: "Pancadas leves",   emoji: "🌦️" },
  95: { label: "Tempestade",       emoji: "⛈️" },
}

function parseRSS(xml: string): { title: string; description: string }[] {
  const items: { title: string; description: string }[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match
  while ((match = itemRegex.exec(xml)) !== null && items.length < 5) {
    const item = match[1]
    const title = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
      || item.match(/<title>(.*?)<\/title>/)?.[1] || "").replace(/<[^>]*>/g, "").trim()
    const description = (item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]
      || item.match(/<description>(.*?)<\/description>/)?.[1] || "").replace(/<[^>]*>/g, "").trim().slice(0, 120)
    if (title) items.push({ title, description })
  }
  return items
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") ?? "weather"
    const url = searchParams.get("url") ?? ""

    let html = ""

    // ── WEATHER ──
    if (type === "weather") {
      const params = new URLSearchParams(url.includes("?") ? url.split("?")[1] : url)
      const city = params.get("city") ?? "São Paulo"
      const lat = params.get("lat") ?? "-23.5505"
      const lon = params.get("lon") ?? "-46.6333"

      const wRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m&timezone=America%2FSao_Paulo&forecast_days=1`,
        { next: { revalidate: 600 } }
      )
      const w = await wRes.json()
      const cur = w.current ?? {}
      const code = cur.weather_code ?? 0
      const weather = WMO[code] ?? { label: "—", emoji: "🌡️" }

      html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:100vw;height:100vh;background:linear-gradient(135deg,#0f2027,#203a43,#2c5364);
display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;color:white;overflow:hidden}
.wrap{text-align:center}
.emoji{font-size:120px;margin-bottom:24px;animation:float 3s ease-in-out infinite;display:block}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
.temp{font-size:96px;font-weight:700;letter-spacing:-4px;line-height:1}
.cond{font-size:28px;opacity:.8;margin-top:8px}
.city{font-size:20px;opacity:.5;margin-top:16px;letter-spacing:.2em;text-transform:uppercase}
.details{display:flex;gap:32px;justify-content:center;margin-top:32px}
.d{font-size:18px}.d span{font-size:13px;opacity:.5;display:block;margin-top:4px}
.brand{position:absolute;bottom:24px;left:50%;transform:translateX(-50%);font-size:11px;opacity:.3;letter-spacing:.2em}
</style></head>
<body><div class="wrap">
<span class="emoji">${weather.emoji}</span>
<div class="temp">${Math.round(cur.temperature_2m ?? 0)}°C</div>
<div class="cond">${weather.label}</div>
<div class="city">${city}</div>
<div class="details">
<div class="d">${Math.round(cur.apparent_temperature ?? 0)}°C<span>Sensação</span></div>
<div class="d">${cur.relative_humidity_2m ?? "--"}%<span>Umidade</span></div>
<div class="d">${Math.round(cur.wind_speed_10m ?? 0)} km/h<span>Vento</span></div>
</div></div>
<div class="brand">DOOHPLAY · Conteúdo Dinâmico</div>
</body></html>`
    }

    // ── NEWS ──
    else if (type === "news") {
      const FEEDS: Record<string, { name: string; url: string }> = {
        g1:       { name: "G1",       url: "https://g1.globo.com/rss/g1/" },
        uol:      { name: "UOL",      url: "https://rss.uol.com.br/feed/noticias.xml" },
        tecmundo: { name: "TecMundo", url: "https://rss.tecmundo.com.br/feed" },
        esportes: { name: "Esportes", url: "https://ge.globo.com/rss/ge/" },
      }
      const source = url || "g1"
      const feed = FEEDS[source] ?? FEEDS.g1
      const nRes = await fetch(feed.url, { headers: { "User-Agent": "DOOHPLAY/1.0" }, next: { revalidate: 300 } })
      const xml = await nRes.text()
      const items = parseRSS(xml)

      html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:100vw;height:100vh;background:#0a0a0a;font-family:system-ui,sans-serif;color:white;overflow:hidden;padding:48px}
.header{display:flex;align-items:center;gap:16px;margin-bottom:40px}
.badge{background:#0284C7;color:white;padding:4px 14px;border-radius:20px;font-size:13px;font-weight:600}
.label{font-size:13px;opacity:.4;letter-spacing:.15em;text-transform:uppercase}
.item{padding:20px 0;border-bottom:1px solid rgba(255,255,255,.08)}
.item:last-child{border-bottom:none}
.title{font-size:20px;font-weight:600;line-height:1.3;margin-bottom:6px}
.desc{font-size:14px;opacity:.5;line-height:1.4}
.brand{position:absolute;top:24px;right:48px;font-size:11px;opacity:.2;letter-spacing:.2em}
</style></head>
<body>
<div class="header"><span class="badge">${feed.name}</span><span class="label">Últimas notícias</span></div>
${items.map(i => `<div class="item"><div class="title">${i.title}</div>${i.description ? `<div class="desc">${i.description}</div>` : ""}</div>`).join("")}
<div class="brand">DOOHPLAY</div>
</body></html>`
    }

    // ── SOCIAL ──
    else if (type === "social") {
      html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:100vw;height:100vh;background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);
display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;color:white;overflow:hidden}
.wrap{text-align:center}
.icon{font-size:80px;margin-bottom:24px}
.title{font-size:36px;font-weight:700}
.handle{font-size:20px;opacity:.7;margin-top:12px}
.cta{margin-top:32px;background:rgba(255,255,255,.2);padding:12px 32px;border-radius:999px;font-size:16px;display:inline-block}
</style></head>
<body><div class="wrap">
<div class="icon">📱</div>
<div class="title">Siga no Instagram</div>
<div class="handle">${url || "@seuperfil"}</div>
<div class="cta">Siga e ganhe desconto</div>
</div></body></html>`
    }

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    })

  } catch (err: any) {
    return new NextResponse(
      `<html><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui">Erro: ${err.message}</body></html>`,
      { headers: { "Content-Type": "text/html" } }
    )
  }
}
