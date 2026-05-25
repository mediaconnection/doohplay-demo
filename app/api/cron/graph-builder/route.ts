export const dynamic = 'force-dynamic';
import { autoBuildGraph } from "@/lib/proof/graph/autoBuildGraph"

export async function GET() {

  try {

    const result = await autoBuildGraph()

    return Response.json({
      success: true,
      result
    })

  } catch (err) {

    return Response.json({
      success: false,
      error: (err as Error).message
    }, { status: 500 })

  }

}
