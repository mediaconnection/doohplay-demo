// Rota de diagnostico TEMPORARIA -- checa o estado da conexao da
// instancia Evolution API (WhatsApp self-hosted) via endpoint de status,
// SEM disparar nenhuma mensagem. Nunca expoe a apikey na resposta. Sera
// removida assim que o diagnostico terminar -- nao e parte do produto.
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { NextResponse } from "next/server"

export async function GET() {
  const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL
  const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY
  const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE

  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
    return NextResponse.json({
      error: "Env vars ausentes",
      hasUrl: !!EVOLUTION_API_URL,
      hasKey: !!EVOLUTION_API_KEY,
      hasInstance: !!EVOLUTION_INSTANCE,
    }, { status: 500 })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${EVOLUTION_INSTANCE}`, {
      method: "GET",
      headers: { apikey: EVOLUTION_API_KEY },
      signal: controller.signal,
    })
    const text = await res.text()
    let json: unknown = null
    try { json = JSON.parse(text) } catch { /* resposta não era JSON */ }

    return NextResponse.json({
      httpStatus: res.status,
      body: json ?? text.slice(0, 500),
    })
  } catch (error) {
    return NextResponse.json({
      error: "Falha ao consultar Evolution API",
      detail: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  } finally {
    clearTimeout(timeout)
  }
}
