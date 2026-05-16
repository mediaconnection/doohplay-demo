import { runProofChainAggregator } from "@/lib/proof/aggregator/proofChainAggregator"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
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
