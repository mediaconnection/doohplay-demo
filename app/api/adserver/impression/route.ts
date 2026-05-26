export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0


export async function POST(req: Request) {
    const { registerImpression } = await import("@/lib/adserver/registerImpression")


  const body = await req.json()

  const impression = await registerImpression(
    body.screen_id,
    body.campaign_id,
    body.creative_id
  )

  return Response.json({
    success: true,
    impression
  })

}

