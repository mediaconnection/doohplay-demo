export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { registerImpression } = await import("@/lib/adserver/registerImpression")
    const body = await req.json()
    const impression = await registerImpression(
      body.screen_id,
      body.campaign_id,
      body.creative_id
    )
    return Response.json({ success: true, impression })
  } catch (error) {
    console.error("IMPRESSION_ROUTE_ERROR", error)
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
