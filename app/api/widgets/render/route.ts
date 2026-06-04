export const dynamic = "force-dynamic"
export const revalidate = 0

import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") ?? "weather"
    const url = searchParams.get("url") ?? ""

    let html = ""

    if (type === "weather") {
      // Parse params from URL: /dynamic/weather?city=SP&lat=-23.5&lon=-46.6
      const params = new URLSearchParams(url.includes("?") ? url.split("?")[1] : "")
      const city = params.get("city") ?? "São Paulo"
      const lat = params.get("lat") ?? "-23.5505"
      const lon = params.get("lon") ?? "-46.6333"

      const wRes = await fetch(`${request.nextUrl.origin}/api/widgets/weather?city=${encodeURIComponent(city)}&lat=${lat}&lon=${lon}`)
      const w = await wRes.json()

      html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  width: 100vw; height: 100vh;
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  display: flex; align-items: center; justify-content: center;
  font-family: system-ui, sans-serif; color: white;
  overflow: hidden;
}
.container { text-align: center; }
.emoji { font-size: 120px; margin-bottom: 24px; animation: float 3s ease-in-out infinite; }
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
.temp { font-size: 96px; font-weight: 700; letter-spacing: -4px; }
.condition { font-size: 28px; opacity: 0.8; margin-top: 8px; }
.city { font-size: 20px; opacity: 0.5; margin-top: 16px; letter-spacing: 0.2em; text-transform: uppercase; }
.details { display: flex; gap: 32px; justify-content: center; margin-top: 32px; }
.detail { font-size: 16px; opacity: 0.7; }
.detail span { font-size: 13px; opacity: 0.5; display: block; margin-top: 4px; }
.brand { position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); font-size: 11px; opacity: 0.3; letter-spacing: 0.2em; }
</style>
</head>
<body>
<div class="container">
  <div class="emoji">${w.emoji ?? "🌡️"}</div>
  <div class="temp">${w.temperature ?? "--"}°C</div>
  <div class="condition">${w.condition ?? ""}</div>
  <div class="city">${w.city ?? "São Paulo"}</div>
  <div class="details">
    <div class="detail">${w.feels_like ?? "--"}°C <span>Sensação</span></div>
    <div class="detail">${w.humidity ?? "--"}% <span>Umidade</span></div>
    <div class="detail">${w.wind ?? "--"} km/h <span>Vento</span></div>
  </div>
</div>
<div class="brand">DOOHPLAY · Conteúdo Dinâmico</div>
</body>
</html>`
    }

    else if (type === "news") {
      const source = url || "g1"
      const nRes = await fetch(`${request.nextUrl.origin}/api/widgets/news?source=${source}`)
      const n = await nRes.json()
      const items = n.items?.slice(0, 5) ?? []

      html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  width: 100vw; height: 100vh;
  background: #0a0a0a;
  font-family: system-ui, sans-serif; color: white;
  overflow: hidden; padding: 48px;
}
.header { display: flex; align-items: center; gap: 16px; margin-bottom: 40px; }
.source-badge { background: #0284C7; color: white; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }
.label { font-size: 13px; opacity: 0.4; letter-spacing: 0.15em; text-transform: uppercase; }
.item { padding: 20px 0; border-bottom: 1px solid rgba(255,255,255,0.08); }
.item:last-child { border-bottom: none; }
.title { font-size: 20px; font-weight: 600; line-height: 1.3; margin-bottom: 6px; }
.desc { font-size: 14px; opacity: 0.5; line-height: 1.4; }
.ticker { position: absolute; bottom: 0; left: 0; right: 0; background: #0284C7; padding: 12px 48px; font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; }
.brand { position: absolute; top: 24px; right: 48px; font-size: 11px; opacity: 0.2; letter-spacing: 0.2em; }
</style>
</head>
<body>
<div class="header">
  <span class="source-badge">${n.source ?? "Notícias"}</span>
  <span class="label">Últimas notícias</span>
</div>
${items.map((item: any) => `
<div class="item">
  <div class="title">${item.title}</div>
  ${item.description ? `<div class="desc">${item.description}</div>` : ""}
</div>`).join("")}
<div class="brand">DOOHPLAY</div>
</body>
</html>`
    }

    else if (type === "social") {
      // Placeholder para Instagram/redes sociais
      html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  width: 100vw; height: 100vh;
  background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
  display: flex; align-items: center; justify-content: center;
  font-family: system-ui, sans-serif; color: white;
}
.container { text-align: center; }
.icon { font-size: 80px; margin-bottom: 24px; }
.title { font-size: 36px; font-weight: 700; }
.handle { font-size: 20px; opacity: 0.7; margin-top: 12px; }
.cta { margin-top: 32px; background: rgba(255,255,255,0.2); padding: 12px 32px; border-radius: 999px; font-size: 16px; display: inline-block; }
</style>
</head>
<body>
<div class="container">
  <div class="icon">📱</div>
  <div class="title">Siga no Instagram</div>
  <div class="handle">${url || "@seuperfil"}</div>
  <div class="cta">Siga agora e ganhe desconto</div>
</div>
</body>
</html>`
    }

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    })

  } catch (err: any) {
    return new NextResponse(`<html><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui">Erro: ${err.message}</body></html>`, {
      headers: { "Content-Type": "text/html" }
    })
  }
}
