import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

const DEMO_VIDEO_URL = "https://doohplay-demo.onrender.com/demo/zimermam-ad.mp4"

function normalizeDuration(value: unknown, fallback = 15) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : fallback
}

function isHttpUrl(value: unknown) {
  return typeof value === "string" && /^https?:\/\//i.test(value)
}

function isPlayableVideoUrl(value: unknown) {
  if (!isHttpUrl(value)) return false

  const url = String(value).toLowerCase()
  return (
    !url.includes("your-project-id") &&
    (
      url.includes(".mp4") ||
      url.includes(".m3u8") ||
      url.includes("video")
    ) &&
    !url.includes(".jpg") &&
    !url.includes(".jpeg") &&
    !url.includes(".png") &&
    !url.includes(".webp") &&
    !url.includes(".gif")
  )
}

function normalizeVideoItem(row: any, position: number) {
  const assetUrl = row.media_file_url ?? row.url ?? row.media_url
  const duration = normalizeDuration(row.media_duration ?? row.duration_seconds ?? row.duration, 15)

  return {
    id: String(row.media_file_id ?? row.id ?? row.campaign_id ?? `video-${position}`),
    name: row.name ?? row.campaign_name ?? row.file_name ?? "Video",
    type: "video",
    url: assetUrl,
    asset_url: assetUrl,
    active: true,
    status: "approved",
    duration,
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

  return {
    ok: true,
    name,
    items: [item],
    slides: [item],
    playlist: [item],
    generated_at: new Date().toISOString(),
  }
}

async function findPlayerOrClient(code: string) {
  const playerRes = await pool.query(
    `SELECT id::text, name, location, is_active, player_code
     FROM players
     WHERE UPPER(player_code) = $1 OR UPPER(id::text) = $1
     LIMIT 1`,
    [code]
  ).catch(() => ({ rows: [] }))

  if (playerRes.rows[0]) {
    return { kind: "player", ...playerRes.rows[0] }
  }

  const clientRes = await pool.query(
    `SELECT code, name, player_id
     FROM studio_clients
     WHERE UPPER(code) = $1
     LIMIT 1`,
    [code]
  ).catch(() => ({ rows: [] }))

  if (clientRes.rows[0]) {
    return { kind: "client", ...clientRes.rows[0], id: clientRes.rows[0].player_id ?? code }
  }

  return null
}

async function fetchCampaignVideos(code: string, owner: any) {
  const rows: any[] = []

  const modern = await pool.query(
    `SELECT
       c.id AS campaign_id,
       c.name AS campaign_name,
       c.duration_seconds,
       c.media_url,
       c.media_type,
       c.priority,
       mf.id AS media_file_id,
       mf.url AS media_file_url,
       mf.duration_seconds AS media_duration,
       mf.media_type AS media_file_type,
       mf.file_name
     FROM campaigns c
     LEFT JOIN campaign_assets ca ON ca.campaign_id = c.id
     LEFT JOIN campaign_media cm ON cm.campaign_id = c.id
     LEFT JOIN media_files mf ON mf.id = ca.media_id OR mf.id = cm.media_id
     WHERE c.is_active = true
       AND (c.status IS NULL OR LOWER(c.status) NOT IN ('rejected', 'inactive'))
       AND (c.start_date IS NULL OR c.start_date <= NOW())
       AND (c.end_date IS NULL OR c.end_date >= NOW())
       AND (
         c.player_code IS NULL
         OR UPPER(c.player_code) = $1
         OR EXISTS (
           SELECT 1 FROM player_campaigns pc
           WHERE pc.campaign_id = c.id AND pc.player_id::text = $2
         )
       )
     ORDER BY c.priority DESC NULLS LAST, c.created_at DESC
     LIMIT 30`,
    [code, String(owner?.id ?? code)]
  ).catch(() => ({ rows: [] }))

  rows.push(...modern.rows)

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

  rows.push(...legacy.rows)

  const seen = new Set<string>()
  return rows
    .map((row, index) => normalizeVideoItem(row, index + 1))
    .filter((item) => item.type === "video" && isPlayableVideoUrl(item.asset_url))
    .filter((item) => {
      if (seen.has(item.asset_url)) return false
      seen.add(item.asset_url)
      return true
    })
}

export async function GET(request: NextRequest) {
  const rawCode = request.nextUrl.searchParams.get("code") ?? request.nextUrl.searchParams.get("screen")
  const code = rawCode?.trim().toUpperCase()

  if (!code) {
    return NextResponse.json({ error: "code obrigatório" }, { status: 400 })
  }

  try {
    const owner = await findPlayerOrClient(code)
    const playlist = await fetchCampaignVideos(code, owner)

    if (playlist.length === 0) {
      return NextResponse.json(fallbackPlaylist(owner?.name ?? code))
    }

    if (owner?.kind === "player" && owner.id) {
      await pool.query(`UPDATE players SET last_ping = NOW() WHERE id::text = $1`, [String(owner.id)]).catch(() => {})
    }

    return NextResponse.json({
      ok: true,
      name: owner?.name ?? code,
      player: owner
        ? { id: owner.id, name: owner.name, location: owner.location ?? null, code }
        : null,
      items: playlist,
      slides: playlist,
      playlist,
      generated_at: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[player/playlist]", error)
    return NextResponse.json(fallbackPlaylist(code))
  }
}
