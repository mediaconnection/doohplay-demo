export const dynamic = "force-dynamic"
export const revalidate = 0

import { NextRequest, NextResponse } from "next/server"

// brapi.dev — essas 4 ações funcionam sem token, sem custo, sem limite
// (não inclui IBOV; pra índice ou outras ações seria preciso token pago).
const FREE_TICKERS = ["PETR4", "VALE3", "MGLU3", "ITUB4"]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requested = (searchParams.get("tickers") || FREE_TICKERS.join(","))
      .split(",")
      .map(t => t.trim().toUpperCase())
      .filter(t => FREE_TICKERS.includes(t)) // ignora silenciosamente qualquer ticker fora da lista livre

    const tickers = requested.length > 0 ? requested : FREE_TICKERS

    const res = await fetch(`https://brapi.dev/api/quote/${tickers.join(",")}`, {
      next: { revalidate: 300 }, // cache 5 min
    })
    if (!res.ok) throw new Error(`brapi respondeu ${res.status}`)

    const data = await res.json()
    const items = (data.results || []).map((r: any) => ({
      symbol: r.symbol,
      name: r.shortName,
      price: r.regularMarketPrice,
      change: r.regularMarketChange,
      change_percent: r.regularMarketChangePercent,
    }))

    return NextResponse.json({
      ok: true,
      items,
      updated_at: new Date().toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
