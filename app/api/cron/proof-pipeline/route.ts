export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0


export async function GET() {
    const { runProofPipeline } = await import("@/lib/proof/scheduler/runProofPipeline")


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

