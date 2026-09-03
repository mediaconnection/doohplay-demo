// Rota de diagnostico TEMPORARIA -- confirma qual chave privada
// signHash() esta usando de fato em producao, e se a chave publica
// derivada dela bate com keys/public.pem versionado. NUNCA expoe a
// chave privada nem a publica em si -- so hashes SHA-256 pra comparacao
// e booleanos de existencia. Sera removida assim que o diagnostico
// terminar -- nao e parte do produto.
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import crypto from "crypto"
import fs from "fs"
import path from "path"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const secretPath = "/etc/secrets/private.pem"
    const localPrivatePath = path.resolve(process.cwd(), "keys/private.pem")
    const publicKeyPath = path.resolve(process.cwd(), "keys/public.pem")

    const hasSecretFile = fs.existsSync(secretPath)
    const hasLocalPrivate = fs.existsSync(localPrivatePath)
    const hasPrivatePemEnv = !!process.env.PRIVATE_PEM?.trim()
    const hasPublicKeyFile = fs.existsSync(publicKeyPath)

    // Replica EXATAMENTE a ordem de resolucao ATUAL de signHash()
    // (src/services/pdf/pdfSigner.ts, pos-fix): PRIVATE_PEM -> keys/private.pem
    // -> /etc/secrets/private.pem
    let resolvedFrom: string | null = null
    let privateKeyPem: string | null = null

    if (hasPrivatePemEnv) {
      const privRaw = process.env.PRIVATE_PEM!.trim()
      privateKeyPem = privRaw.startsWith("-----")
        ? privRaw
        : "-----BEGIN PRIVATE KEY-----\n" + privRaw.match(/.{1,64}/g)!.join("\n") + "\n-----END PRIVATE KEY-----\n"
      resolvedFrom = "PRIVATE_PEM (env var)"
    } else if (hasLocalPrivate) {
      privateKeyPem = fs.readFileSync(localPrivatePath, "utf8")
      resolvedFrom = "keys/private.pem"
    } else if (hasSecretFile) {
      privateKeyPem = fs.readFileSync(secretPath, "utf8")
      resolvedFrom = "/etc/secrets/private.pem"
    }

    let derivedPublicKeyHash: string | null = null
    let versionedPublicKeyHash: string | null = null
    let keysMatch: boolean | null = null
    let keyDeriveError: string | null = null
    let privateKeyPemFirst60: string | null = null

    if (privateKeyPem) {
      // So os primeiros 60 caracteres (cabecalho PEM + poucas linhas de
      // base64) -- suficiente pra diagnosticar formato sem expor a chave
      // inteira.
      privateKeyPemFirst60 = privateKeyPem.slice(0, 60)
      try {
        const privateKeyObj = crypto.createPrivateKey(privateKeyPem)
        const publicKeyObj = crypto.createPublicKey(privateKeyObj)
        const derivedPem = publicKeyObj.export({ type: "spki", format: "pem" }) as string
        derivedPublicKeyHash = crypto.createHash("sha256").update(derivedPem).digest("hex")
      } catch (err) {
        keyDeriveError = err instanceof Error ? err.message : String(err)
      }
    }

    if (hasPublicKeyFile) {
      const versionedPem = fs.readFileSync(publicKeyPath, "utf8")
      versionedPublicKeyHash = crypto.createHash("sha256").update(versionedPem).digest("hex")
    }

    if (derivedPublicKeyHash && versionedPublicKeyHash) {
      keysMatch = derivedPublicKeyHash === versionedPublicKeyHash
    }

    return NextResponse.json({
      hasSecretFile,
      hasLocalPrivate,
      hasPrivatePemEnv,
      hasPublicKeyFile,
      resolvedFrom,
      privateKeyPemFirst60,
      keyDeriveError,
      derivedPublicKeyHash,
      versionedPublicKeyHash,
      keysMatch,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro no diagnóstico", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
