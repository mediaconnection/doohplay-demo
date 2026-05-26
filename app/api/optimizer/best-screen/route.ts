export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0


export async function GET() {
    const { selectBestScreen } = await import("@/lib/optimizer/selectBestScreen")


  const screen = await selectBestScreen("auto")

  return Response.json({
    success: true,
    screen
  })

}

