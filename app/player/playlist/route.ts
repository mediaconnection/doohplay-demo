import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({
    items: [
      {
        id: "demo-1",
        type: "image",
        url: "/demo.jpg",
        duration: 10
      }
    ]
  })
}