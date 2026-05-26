export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0


export const runtime = "nodejs"

export async function GET() {
    const { runProofChainAggregator } = await import("@/lib/proof/aggregator/proofChainAggregator")

  try {
    const result = await runProofChainAggregator()
    return Response.json({ success: true, result })
  } catch (err) {
    console.error("[proofchain-cron] Error:", err)
    return Response.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    )
  }
}

