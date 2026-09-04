// Rota de captura TEMPORARIA -- devolve a chave PUBLICA (nao sensivel)
// derivada de PRIVATE_PEM em producao, pra commitar como keys/public.pem
// e sincronizar de verdade com a chave que signHash() realmente usa.
// Sera removida assim que a captura terminar -- nao e parte do produto.
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import crypto from "crypto"
import { NextResponse } from "next/server"

export async function GET() {
  const privRaw = process.env.PRIVATE_PEM?.trim()
  if (!privRaw) {
    return NextResponse.json({ error: "PRIVATE_PEM não configurada" }, { status: 500 })
  }
  const priv = privRaw.startsWith("-----")
    ? privRaw
    : "-----BEGIN PRIVATE KEY-----\n" + privRaw.match(/.{1,64}/g)!.join("\n") + "\n-----END PRIVATE KEY-----\n"

  const publicKeyObj = crypto.createPublicKey(crypto.createPrivateKey(priv))
  const pub = publicKeyObj.export({ type: "spki", format: "pem" }) as string

  return NextResponse.json({ publicKeyPem: pub, hash: crypto.createHash("sha256").update(pub).digest("hex") })
}
