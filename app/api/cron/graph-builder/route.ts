export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0


export async function GET() {
    const { autoBuildGraph } = await import("@proof-engine/proof/graph/autoBuildGraph")


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

