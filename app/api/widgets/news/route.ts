export const dynamic = "force-dynamic"
export const revalidate = 0

import { NextRequest, NextResponse } from "next/server"

const FEEDS: Record<string, { name: string; url: string }> = {
  g1:       { name: "G1",        url: "https://g1.globo.com/rss/g1/" },
  uol:      { name: "UOL",       url: "https://rss.uol.com.br/feed/noticias.xml" },
  r7:       { name: "R7",        url: "https://noticias.r7.com/feed.xml" },
  tecmundo: { name: "TecMundo",  url: "https://rss.tecmundo.com.br/feed" },
  esportes: { name: "Esportes",  url: "https://ge.globo.com/rss/ge/" },
}

function parseRSS(xml: string): { title: string; description: string; link: string; pubDate: string }[] {
  const items: { title: string; description: string; link: string; pubDate: string }[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(xml)) !== null && items.length < 8) {
    const item = match[1]
    const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/)?.[1]
      || item.match(/<title>(.*?)<\/title>/)?.[1] || ""
    const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/)?.[1]
      || item.match(/<description>(.*?)<\/description>/)?.[1] || ""
    const link = item.match(/<link>(.*?)<\/link>/)?.[1] || ""
    const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ""

    // Remove HTML tags from description
    const cleanDesc = description.replace(/<[^>]*>/g, "").trim().slice(0, 120)
    const cleanTitle = title.replace(/<[^>]*>/g, "").trim()

    if (cleanTitle) {
      items.push({ title: cleanTitle, description: cleanDesc, link, pubDate })
    }
  }

  return items
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get("source") ?? "g1"
    const feed = FEEDS[source] ?? FEEDS.g1

    const res = await fetch(feed.url, {
      headers: { "User-Agent": "DOOHPLAY/1.0" },
      next: { revalidate: 300 } // cache 5 min
    })

    if (!res.ok) throw new Error(`Feed error: ${res.status}`)

    const xml = await res.text()
    const items = parseRSS(xml)

    return NextResponse.json({
      ok: true,
      source: feed.name,
      items,
      updated_at: new Date().toISOString(),
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
