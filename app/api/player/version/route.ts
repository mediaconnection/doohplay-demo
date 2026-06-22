// app/api/player/version/route.ts
//
// Retorna um identificador da versão de código atualmente em execução no
// servidor. O Render preenche RENDER_GIT_COMMIT automaticamente em cada
// deploy — o player usa isso pra saber se precisa recarregar (sem precisar
// de WebSocket nem nenhuma infraestrutura nova).
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const version = process.env.RENDER_GIT_COMMIT || "dev"
  return NextResponse.json({ version })
}
