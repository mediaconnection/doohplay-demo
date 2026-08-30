// app/api/players/sla-real-history/route.ts
// Mesma metodologia real de /api/players/sla-history (lib/sla.ts) — dois
// componentes distintos do dashboard (SlaChart.tsx e SlaRanking.tsx)
// esperam essa mesma forma de resposta em endpoints com nomes diferentes,
// então mantemos os dois endpoints, ambos finos, chamando o mesmo helper.
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { computeSlaHistory } from "@/lib/sla"

export const runtime = "nodejs"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  try {
    const history = await computeSlaHistory(7)
    return NextResponse.json({ history }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("SLA_REAL_HISTORY_ROUTE_ERROR", error)
    return NextResponse.json(
      { error: "Erro ao calcular histórico de SLA", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
