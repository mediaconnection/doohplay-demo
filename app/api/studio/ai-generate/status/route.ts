// app/api/studio/ai-generate/status/route.ts
// Polling de progresso do job de geração de 3 conceitos disparado por
// POST /api/studio/ai-generate (Fase 45, 30/08/2026). O job roda em
// background no mesmo processo Node; essa rota só lê o estado gravado em
// Redis por lib/aiCreativeJobs.ts.
import { NextRequest, NextResponse } from "next/server"
import { getJobStatus } from "@/lib/aiCreativeJobs"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get("jobId")

  if (!jobId) {
    return NextResponse.json({ error: "jobId obrigatório" }, { status: 400 })
  }

  const job = await getJobStatus(jobId)
  if (!job) {
    // Job nunca existiu, já terminou e expirou (TTL de 5min), ou Redis
    // momentaneamente fora do ar — o frontend trata isso como "ainda não
    // apareceu" e continua o polling por um tempo antes de desistir.
    return NextResponse.json({ status: "not_found" }, { status: 404 })
  }

  return NextResponse.json(job)
}
