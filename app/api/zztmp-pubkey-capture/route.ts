// Rota de teste TEMPORARIA -- mais uma camada de isolamento pro bug de
// assinatura. Sera removida assim que o teste terminar -- nao e parte
// do produto.
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import crypto from "crypto"
import fs from "fs"
import path from "path"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { signHash } = await import("@/services/pdf/pdfSigner")
    const { verifySignature } = await import("@/services/pdf/verifySignature.node")

    const testHash = crypto.createHash("sha256").update("teste-isolado-" + Date.now()).digest("hex")
    const signature = signHash(testHash)

    // Teste 1: verifySignature.node.ts como está (lê keys/public.pem do disco)
    const isValidViaModule = verifySignature(testHash, signature)

    // Teste 2: verifica com a chave pública derivada NA HORA de PRIVATE_PEM,
    // em memória -- bypassa completamente o fs.readFileSync do módulo.
    const privRaw = process.env.PRIVATE_PEM!.trim()
    const priv = privRaw.startsWith("-----")
      ? privRaw
      : "-----BEGIN PRIVATE KEY-----\n" + privRaw.match(/.{1,64}/g)!.join("\n") + "\n-----END PRIVATE KEY-----\n"
    const freshPublicKeyObj = crypto.createPublicKey(crypto.createPrivateKey(priv))
    const verify2 = crypto.createVerify("RSA-SHA256")
    verify2.update(Buffer.from(testHash, "hex"))
    verify2.end()
    const isValidViaFreshKey = verify2.verify(freshPublicKeyObj, signature, "base64")

    // Teste 3: le keys/public.pem do disco manualmente aqui (mesmo path
    // que o modulo usa) e verifica com ele -- confirma se e um problema
    // do arquivo em si ou de como o modulo especificamente le/usa ele.
    const fileContent = fs.readFileSync(path.resolve(process.cwd(), "keys/public.pem"), "utf8")
    const verify3 = crypto.createVerify("RSA-SHA256")
    verify3.update(Buffer.from(testHash, "hex"))
    verify3.end()
    const isValidViaFileReadHere = verify3.verify(fileContent, signature, "base64")

    return NextResponse.json({
      testHash,
      signatureLength: signature.length,
      isValidViaModule,
      isValidViaFreshKey,
      isValidViaFileReadHere,
      fileContentBytes: fileContent.length,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro no teste", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
