export const dynamic = "force-dynamic"
export const revalidate = 0

import { NextRequest, NextResponse } from "next/server"

// Open-Meteo — grátis, sem chave de API
// WMO Weather codes
const WMO: Record<number, { label: string; emoji: string }> = {
  0:  { label: "Céu limpo",       emoji: "☀️" },
  1:  { label: "Principalmente limpo", emoji: "🌤️" },
  2:  { label: "Parcialmente nublado", emoji: "⛅" },
  3:  { label: "Nublado",          emoji: "☁️" },
  45: { label: "Neblina",          emoji: "🌫️" },
  48: { label: "Neblina com gelo", emoji: "🌫️" },
  51: { label: "Garoa leve",       emoji: "🌦️" },
  53: { label: "Garoa moderada",   emoji: "🌦️" },
  55: { label: "Garoa intensa",    emoji: "🌧️" },
  61: { label: "Chuva leve",       emoji: "🌧️" },
  63: { label: "Chuva moderada",   emoji: "🌧️" },
  65: { label: "Chuva intensa",    emoji: "🌧️" },
  80: { label: "Pancadas leves",   emoji: "🌦️" },
  81: { label: "Pancadas moderadas", emoji: "🌧️" },
  82: { label: "Pancadas intensas", emoji: "⛈️" },
  95: { label: "Tempestade",       emoji: "⛈️" },
  99: { label: "Tempestade com granizo", emoji: "⛈️" },
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Coordenadas — default São Paulo
    const lat = searchParams.get("lat") ?? "-23.5505"
    const lon = searchParams.get("lon") ?? "-46.6333"
    const city = searchParams.get("city") ?? "São Paulo"

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m&timezone=America%2FSao_Paulo&forecast_days=1`

    const res = await fetch(url, { next: { revalidate: 600 } }) // cache 10 min
    if (!res.ok) throw new Error("Weather API error")

    const data = await res.json()
    const current = data.current

    const code = current.weather_code ?? 0
    const weather = WMO[code] ?? { label: "—", emoji: "🌡️" }

    return NextResponse.json({
      ok: true,
      city,
      temperature: Math.round(current.temperature_2m),
      feels_like: Math.round(current.apparent_temperature),
      humidity: current.relative_humidity_2m,
      wind: Math.round(current.wind_speed_10m),
      condition: weather.label,
      emoji: weather.emoji,
      code,
      updated_at: new Date().toISOString(),
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
