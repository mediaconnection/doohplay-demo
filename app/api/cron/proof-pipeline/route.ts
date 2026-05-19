import { runProofPipeline } from "@/lib/proof/scheduler/runProofPipeline"

export async function GET() {

  try {

    const result = await runProofPipeline()

    return Response.json({
      success: true,
      pipeline: result
    })

  } catch (err) {

    return Response.json({
      success: false,
      error: (err as Error).message
    }, { status: 500 })

  }

}