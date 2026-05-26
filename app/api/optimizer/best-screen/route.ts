export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { selectBestScreen } from "@/lib/optimizer/selectBestScreen"

export async function GET() {

  const screen = await selectBestScreen("auto")

  return Response.json({
    success: true,
    screen
  })

}

