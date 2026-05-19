import { selectBestScreen } from "@/lib/optimizer/selectBestScreen"

export async function GET() {

  const screen = await selectBestScreen("auto")

  return Response.json({
    success: true,
    screen
  })

}