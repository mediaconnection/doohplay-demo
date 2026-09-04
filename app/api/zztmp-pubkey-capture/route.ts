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

    // Teste 4: sanity check do ambiente -- par de chaves efêmero, gerado
    // agora, sem NENHUMA relação com PRIVATE_PEM/keys/public.pem. Se isso
    // também falhar, o problema é do Node/OpenSSL deste ambiente, não da
    // chave configurada.
    const { publicKey: ephemeralPub, privateKey: ephemeralPriv } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    })
    const signEphemeral = crypto.createSign("RSA-SHA256")
    signEphemeral.update(Buffer.from(testHash, "hex"))
    signEphemeral.end()
    const ephemeralSignature = signEphemeral.sign(ephemeralPriv, "base64")
    const verifyEphemeral = crypto.createVerify("RSA-SHA256")
    verifyEphemeral.update(Buffer.from(testHash, "hex"))
    verifyEphemeral.end()
    const isValidEphemeral = verifyEphemeral.verify(ephemeralPub, ephemeralSignature, "base64")

    const privKeyObj = crypto.createPrivateKey(priv)
    const pubKeyObj = crypto.createPublicKey(privKeyObj)

    // Teste 5: assina usando o KeyObject ja parseado (em vez da string PEM
    // crua) -- e verifica contra ele mesmo. Se isso funcionar mas o teste
    // 2 (string crua) nao, o bug e em como .sign() trata string vs KeyObject.
    const signViaKeyObj = crypto.createSign("RSA-SHA256")
    signViaKeyObj.update(Buffer.from(testHash, "hex"))
    signViaKeyObj.end()
    const signatureViaKeyObj = signViaKeyObj.sign(privKeyObj, "base64")
    const verifyViaKeyObj = crypto.createVerify("RSA-SHA256")
    verifyViaKeyObj.update(Buffer.from(testHash, "hex"))
    verifyViaKeyObj.end()
    const isValidViaKeyObj = verifyViaKeyObj.verify(pubKeyObj, signatureViaKeyObj, "base64")

    // Teste 6: usa crypto.sign/crypto.verify (API one-shot, nao a classe
    // streaming Sign/Verify) -- se isso funcionar mas os outros nao, o bug
    // e especifico das classes Sign/Verify streaming pra esta chave.
    const oneShotSig = crypto.sign("RSA-SHA256", Buffer.from(testHash, "hex"), priv)
    const isValidOneShot = crypto.verify("RSA-SHA256", Buffer.from(testHash, "hex"), fileContent, oneShotSig)

    const bigintSafe = (obj: unknown) => JSON.parse(JSON.stringify(obj, (_k, v) => typeof v === "bigint" ? v.toString() : v))

    return NextResponse.json({
      testHash,
      signatureLength: signature.length,
      isValidViaModule,
      isValidViaFreshKey,
      isValidViaFileReadHere,
      fileContentBytes: fileContent.length,
      isValidEphemeral,
      privKeyType: privKeyObj.asymmetricKeyType,
      privKeyDetails: bigintSafe(privKeyObj.asymmetricKeyDetails),
      pubKeyType: pubKeyObj.asymmetricKeyType,
      pubKeyDetails: bigintSafe(pubKeyObj.asymmetricKeyDetails),
      isValidViaKeyObj,
      isValidOneShot,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro no teste", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
