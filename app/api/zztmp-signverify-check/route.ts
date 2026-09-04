// Rota de teste TEMPORARIA -- reconfirma se o fix (KeyObject pre-parseado)
// esta realmente ativo neste deploy, chamando signHash()/verifySignature()
// de verdade (nao uma reimplementacao inline). Sera removida assim que
// o teste terminar -- nao e parte do produto.
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import crypto from "crypto"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { signHash } = await import("@/services/pdf/pdfSigner")
    const { verifySignature } = await import("@/services/pdf/verifySignature.node")

    const testHash = crypto.createHash("sha256").update("recheck-" + Date.now()).digest("hex")
    const signature = signHash(testHash)
    const isValid = verifySignature(testHash, signature)

    // Também testa MULTIPLAS vezes seguidas, pra descartar não-determinismo.
    const results: boolean[] = []
    for (let i = 0; i < 5; i++) {
      const h = crypto.createHash("sha256").update("recheck-loop-" + i + "-" + Date.now()).digest("hex")
      const s = signHash(h)
      results.push(verifySignature(h, s))
    }

    return NextResponse.json({ testHash, signatureLength: signature.length, isValid, loopResults: results })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro no teste", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
