import { registerImpression } from "@/lib/adserver/registerImpression"

export async function POST(req: Request) {

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