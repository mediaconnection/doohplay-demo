// Rota de teste TEMPORARIA -- isola sign+verify no mesmo processo, sem
// banco de dados no meio, pra confirmar se o problema esta no par de
// chaves ou em signHash()/verifySignature.node.ts. Sera removida assim
// que o teste terminar -- nao e parte do produto.
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import crypto from "crypto"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { signHash } = await import("@/services/pdf/pdfSigner")
    const { verifySignature } = await import("@/services/pdf/verifySignature.node")

    const testHash = crypto.createHash("sha256").update("teste-isolado-" + Date.now()).digest("hex")
    const signature = signHash(testHash)
    const isValid = verifySignature(testHash, signature)

    return NextResponse.json({ testHash, signatureLength: signature.length, isValid })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro no teste", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
