export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server"
import { pool } from "@/lib/db"

const DEMO_VIDEO_URL = "https://doohplay-demo.onrender.com/demo/zimermam-ad.mp4"

function isHttpUrl(value: unknown) {
  return typeof value === "string" && /^https?:\/\//i.test(value)
}

function videoItem(row: any, position: number) {
  const assetUrl = row.media_file_url ?? row.url ?? row.media_url

  return {
    id: String(row.media_file_id ?? row.id ?? row.campaign_id ?? `video-${position}`),
    name: row.name ?? row.campaign_name ?? "Video",
    type: "video",
    url: assetUrl,
    asset_url: assetUrl,
    active: true,
    status: "approved",
    duration: Number(row.media_duration ?? row.duration_seconds ?? row.duration ?? 15),
    position,
    campaign_id: row.campaign_id ?? null,
    slot_category: row.slot_category ?? "anunciante",
  }
}

function fallbackPlaylist(name = "DOOHPLAY") {
  const item = {
    id: "demo-zimermam",
    name: "Demo Barbearia Zimermam",
    type: "video",
    url: DEMO_VIDEO_URL,
    asset_url: DEMO_VIDEO_URL,
    active: true,
    status: "approved",
    duration: 30,
    position: 1,
    campaign_id: "demo",
    slot_category: "anunciante",
  }

  return { ok: true, name, items: [item], slides: [item], playlist: [item] }
}

async function fetchVideos(code: string) {
  const modern = await pool.query(
    `SELECT
       c.id AS campaign_id,
       c.name AS campaign_name,
       c.duration_seconds,
       c.media_url,
       c.media_type,
       mf.id AS media_file_id,
       mf.url AS media_file_url,
       mf.duration_seconds AS media_duration,
       mf.media_type AS media_file_type
     FROM campaigns c
     LEFT JOIN campaign_assets ca ON ca.campaign_id = c.id
     LEFT JOIN campaign_media cm ON cm.campaign_id = c.id
     LEFT JOIN media_files mf ON mf.id = ca.media_id OR mf.id = cm.media_id
     WHERE c.is_active = true
       AND (c.status IS NULL OR LOWER(c.status) NOT IN ('rejected', 'inactive'))
       AND (c.start_date IS NULL OR c.start_date <= NOW())
       AND (c.end_date IS NULL OR c.end_date >= NOW())
       AND (c.player_code IS NULL OR UPPER(c.player_code) = $1)
     ORDER BY c.priority DESC NULLS LAST, c.created_at DESC
     LIMIT 30`,
    [code]
  ).catch(() => ({ rows: [] }))

  const legacy = await pool.query(
    `SELECT
       m.id::text AS media_file_id,
       m.url,
       m.type AS media_file_type,
       m.name,
       c.id AS campaign_id,
       c.name AS campaign_name,
       15 AS duration_seconds
     FROM "CampaignMedia" m
     JOIN "Campaign" c ON c.id = m."campaignId"
     WHERE m.status = 'approved'
       AND c.status = 'active'
       AND c."startDate" <= NOW()
       AND c."endDate" >= NOW()
     ORDER BY RANDOM()
     LIMIT 30`
  ).catch(() => ({ rows: [] }))

  const seen = new Set<string>()
  return [...modern.rows, ...legacy.rows]
    .map((row, index) => videoItem(row, index + 1))
    .filter((item) => isHttpUrl(item.asset_url))
    .filter((item) => {
      if (seen.has(item.asset_url)) return false
      seen.add(item.asset_url)
      return true
    })
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params
    const screenCode = String(code ?? "").trim().toUpperCase()

    if (!screenCode) {
      return NextResponse.json({ error: "code obrigatório" }, { status: 400 })
    }

    const client = await pool.query(
      `SELECT name FROM studio_clients WHERE UPPER(code) = $1 LIMIT 1`,
      [screenCode]
    ).catch(() => ({ rows: [] }))

    const items = await fetchVideos(screenCode)

    if (items.length === 0) {
      return NextResponse.json(fallbackPlaylist(client.rows[0]?.name ?? screenCode))
    }

    return NextResponse.json({
      ok: true,
      name: client.rows[0]?.name ?? screenCode,
      items,
      slides: items,
      playlist: items,
      generated_at: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[client/playlist]", error)
    return NextResponse.json(fallbackPlaylist())
  }
}
