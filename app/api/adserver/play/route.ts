export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0


export async function POST(req: Request) {
    const { selectCreative } = await import("@/lib/adserver/selectCreative")


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

