import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

export const dynamic = "force-dynamic"

const EVOLUTION_API_URL  = process.env.EVOLUTION_API_URL!
const EVOLUTION_API_KEY  = process.env.EVOLUTION_API_KEY!
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE!

async function checkAuth(req: NextRequest) {
  const session = await getServerSession()
  const secret = req.nextUrl.searchParams.get("secret")
  return !!session?.user || (secret && secret === process.env.ADMIN_SECRET)
}

// GET — checa se a instância do WhatsApp (Evolution API) está conectada.
// Existe porque "Falha ao enviar WhatsApp" pode ser bug de código OU sessão
// desconectada (precisa escanear QR de novo) — sem isso, não dava pra saber
// qual dos dois sem abrir o painel do Evolution manualmente.
export async function GET(req: NextRequest) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
    return NextResponse.json({
      connected: false,
      error: "Variáveis de ambiente do Evolution API não configuradas (EVOLUTION_API_URL/EVOLUTION_API_KEY/EVOLUTION_INSTANCE)",
    }, { status: 200 })
  }

  try {
    const res = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${EVOLUTION_INSTANCE}`, {
      method: "GET",
      headers: { "apikey": EVOLUTION_API_KEY },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      const body = await res.text()
      return NextResponse.json({
        connected: false,
        error: `Evolution API respondeu ${res.status}`,
        detail: body.slice(0, 500),
      }, { status: 200 })
    }

    const data = await res.json()
    // Evolution API retorna algo como { instance: { state: "open" | "close" | "connecting" } }
    const state = data?.instance?.state ?? data?.state ?? "unknown"
    const connected = state === "open"

    return NextResponse.json({
      connected,
      state,
      message: connected
        ? "✅ WhatsApp conectado e pronto pra enviar mensagens"
        : state === "connecting"
        ? "🟡 Conectando... aguarde ou escaneie o QR code de novo"
        : "🔴 Desconectado — precisa escanear o QR code de novo no painel do Evolution API",
      raw: data,
    })
  } catch (err: any) {
    return NextResponse.json({
      connected: false,
      error: err.name === "TimeoutError" ? "Evolution API não respondeu a tempo (timeout)" : err.message,
    }, { status: 200 })
  }
}
