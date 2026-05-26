export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextRequest, NextResponse } from "next/server"
import type {
  TrustGraphFilters,
  TrustGraphResponse,
  TrustGraphRouteError,
  TrustGraphRouteSuccess
} from "@/lib/trust-graph/types"

export const runtime = "nodejs"

const DEFAULT_HOURS = 24
const MAX_HOURS = 24 * 30

const DEFAULT_LIMIT_NODES = 200
const MAX_LIMIT_NODES = 1000

const DEFAULT_LIMIT_EDGES = 400
const MAX_LIMIT_EDGES = 3000

function parsePositiveInt(
  value: string | null,
  fallback: number,
  max: number
): number {
  if (typeof value !== "string") {
    return fallback
  }

  const trimmed = value.trim()

  if (trimmed.length === 0) {
    return fallback
  }

  const parsed = Number(trimmed)

  if (!Number.isFinite(parsed)) {
    return fallback
  }

  const normalized = Math.trunc(parsed)

  if (normalized <= 0) {
    return fallback
  }

  return Math.min(normalized, max)
}

function parseOptionalString(value: string | null): string | null {
  if (typeof value !== "string") {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function parseOptionalId(value: string | null): string | null {
  const parsed = parseOptionalString(value)

  if (!parsed) {
    return null
  }

  return parsed.length <= 200 ? parsed : null
}

function noStoreHeaders(): HeadersInit {
  return {
    "Cache-Control": "no-store, max-age=0"
  }
}

function buildFilters(req: NextRequest): TrustGraphFilters {
  const searchParams = req.nextUrl.searchParams

  return {
    hours: parsePositiveInt(
      searchParams.get("hours"),
      DEFAULT_HOURS,
      MAX_HOURS
    ),
    limitNodes: parsePositiveInt(
      searchParams.get("limitNodes"),
      DEFAULT_LIMIT_NODES,
      MAX_LIMIT_NODES
    ),
    limitEdges: parsePositiveInt(
      searchParams.get("limitEdges"),
      DEFAULT_LIMIT_EDGES,
      MAX_LIMIT_EDGES
    ),
    campaignId: parseOptionalId(searchParams.get("campaignId")),
    advertiserId: parseOptionalId(searchParams.get("advertiserId")),
    deviceId: parseOptionalId(searchParams.get("deviceId"))
  }
}

function buildSuccessResponse(data: TrustGraphResponse): TrustGraphRouteSuccess {
  return {
    ok: true,
    ...data
  }
}

function buildErrorResponse(error: unknown): TrustGraphRouteError {
  return {
    ok: false,
    error: "TRUST_GRAPH_ROUTE_FAILED",
    message: error instanceof Error ? error.message : "UNKNOWN_ERROR"
  }
}

export async function GET(req: NextRequest) {
    const { getTrustGraph } = await import("@/lib/trust-graph/service")

  try {
    const filters = buildFilters(req)
    const data = await getTrustGraph(filters)

    return NextResponse.json(buildSuccessResponse(data), {
      status: 200,
      headers: noStoreHeaders()
    })
  } catch (error) {
    console.error("TRUST_GRAPH_ROUTE_FAILED", error)

    return NextResponse.json(buildErrorResponse(error), {
      status: 500,
      headers: noStoreHeaders()
    })
  }
}
