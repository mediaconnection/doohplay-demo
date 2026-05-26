export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { mintMediaToken } from "@/lib/tokenization/mintMediaToken"

export async function POST(req: Request) {

  const body = await req.json()

  const token = await mintMediaToken(
    body.campaign_id,
    body.impressions,
    body.proof_root,
    body.owner
  )

  return Response.json({
    success: true,
    token
  })

}

