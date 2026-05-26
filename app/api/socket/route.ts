export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server"

import { getIO } from "@/lib/socket/server"

export const runtime = "nodejs"

export async function GET() {
  try {
    const io = getIO()

    return NextResponse.json(
      {
        ok: true,
        socket: "ready",
        initialized: Boolean(io)
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    )
  } catch (error) {
    console.error("SOCKET_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        ok: false,
        error: "SOCKET_INIT_FAILED",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
