import crypto from "crypto"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { emitCanonicalEvent } from "@/core/audit/emitCanonicalEvent"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type HeartbeatBody = {
  screen_id?: unknown
  version?: unknown
}

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function getSupabaseClient() {
  const url = safeString(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const serviceRoleKey = safeString(process.env.SUPABASE_SERVICE_ROLE_KEY)

  if (!url || !serviceRoleKey) return null

  return createClient(url, serviceRoleKey)
}

function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for")
  const realIp = req.headers.get("x-real-ip")
  const raw = forwardedFor ?? realIp ?? "unknown"

  return raw.includes(",") ? raw.split(",")[0]?.trim() || "unknown" : raw.trim()
}

function deterministicHeartbeatEventId(screenId: string, date: Date): string {
  return crypto
    .createHash("sha256")
    .update(`${screenId}-heartbeat-${Math.floor(date.getTime() / 60_000)}`)
    .digest("hex")
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as HeartbeatBody | null

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "INVALID_JSON_BODY" }, { status: 400 })
    }

    const screenId = safeString(body.screen_id)
    const version = safeString(body.version) ?? "unknown"

    if (!screenId) {
      return NextResponse.json({ error: "SCREEN_ID_REQUIRED" }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    if (!supabase) {
      return NextResponse.json(
        { error: "SUPABASE_ENV_MISSING" },
        { status: 500 }
      )
    }

    const ip = getClientIp(req)
    const now = new Date()
    const occurredAt = now.toISOString()
    const eventId = deterministicHeartbeatEventId(screenId, now)

    const { data, error } = await supabase
      .from("screens")
      .upsert({
        id: screenId,
        last_seen: occurredAt,
        status: "online",
        player_version: version,
        ip_address: ip
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    await emitCanonicalEvent({
      event_type: "PLAYER_HEARTBEAT",
      source_table: "screens",
      source_id: screenId,
      device_id: screenId,
      occurred_at: occurredAt,
      payload: {
        event_id: eventId,
        version,
        ip
      }
    })

    return NextResponse.json({
      success: true,
      event_id: eventId,
      screen: data
    })
  } catch (error) {
    console.error("HEARTBEAT_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        error: "HEARTBEAT_FAILED",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}