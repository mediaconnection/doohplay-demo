import { selectCreative } from "@/lib/adserver/selectCreative"

export async function POST(req: Request) {

  const body = await req.json()

  const creative = await selectCreative(
    body.screen_id
  )

  if (!creative) {

    return Response.json({
      play: false
    })

  }

  return Response.json({
    play: true,
    creative
  })

}