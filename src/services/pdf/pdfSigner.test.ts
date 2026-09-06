import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest"
import { generateKeyPairSync, createVerify, createHash } from "crypto"
import { signHash } from "./pdfSigner"
import { verifySignature } from "./verifySignature.node"

// Chave efêmera gerada só pra este teste -- NUNCA a chave real de produção
// (PRIVATE_PEM), que não está disponível (nem deveria estar) neste ambiente.
const { privateKey: ephemeralPrivateKeyPem, publicKey: ephemeralPublicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
})

function hashOf(text: string): string {
  return createHash("sha256").update(text).digest("hex")
}

function verifyWithEphemeralKey(hash: string, signatureBase64: string): boolean {
  const verify = createVerify("RSA-SHA256")
  verify.update(Buffer.from(hash, "hex"))
  verify.end()
  return verify.verify(ephemeralPublicKey, signatureBase64, "base64")
}

describe("signHash", () => {
  const originalPrivatePem = process.env.PRIVATE_PEM

  afterAll(() => {
    if (originalPrivatePem === undefined) delete process.env.PRIVATE_PEM
    else process.env.PRIVATE_PEM = originalPrivatePem
  })

  beforeEach(() => {
    delete process.env.PRIVATE_PEM
  })

  // Round-trip completo usando uma chave efêmera via PRIVATE_PEM -- exercita
  // o código real de signHash() (prioridade de fonte da chave, formatação
  // PEM, decodificação hex do hash, pré-parse com createPrivateKey) sem
  // depender da chave real de produção, que não existe neste ambiente.
  it("assina um hash e a assinatura verifica corretamente com a chave pública correspondente", () => {
    process.env.PRIVATE_PEM = ephemeralPrivateKeyPem
    const hash = hashOf("conteúdo de teste")

    const signature = signHash(hash)

    expect(verifyWithEphemeralKey(hash, signature)).toBe(true)
  })

  it("aceita PRIVATE_PEM sem os cabeçalhos -----BEGIN/END----- e ainda assina corretamente", () => {
    // Formato usado em produção às vezes: só o corpo base64, sem os headers
    // PEM -- signHash() precisa detectar isso e envolver o cabeçalho sozinho.
    const body = ephemeralPrivateKeyPem
      .replace(/-----BEGIN PRIVATE KEY-----\n?/, "")
      .replace(/-----END PRIVATE KEY-----\n?/, "")
      .replace(/\n/g, "")
    process.env.PRIVATE_PEM = body

    const hash = hashOf("conteúdo sem headers PEM")
    const signature = signHash(hash)

    expect(verifyWithEphemeralKey(hash, signature)).toBe(true)
  })

  it("assinaturas de hashes diferentes não são intercambiáveis", () => {
    process.env.PRIVATE_PEM = ephemeralPrivateKeyPem
    const hashA = hashOf("A")
    const hashB = hashOf("B")

    const signatureA = signHash(hashA)

    expect(verifyWithEphemeralKey(hashB, signatureA)).toBe(false)
  })

  it("lança erro claro quando nenhuma chave privada está disponível", () => {
    // Sem PRIVATE_PEM e sem keys/private.pem/etc/secrets/private.pem neste
    // ambiente de teste -- é exatamente o estado esperado fora de produção.
    expect(() => signHash(hashOf("sem chave"))).toThrow(/Chave privada não encontrada/)
  })
})

describe("verifySignature", () => {
  it("retorna false (não lança exceção) para uma assinatura inválida/adulterada", () => {
    const hash = hashOf("qualquer conteúdo")
    expect(verifySignature(hash, "YXNzaW5hdHVyYS1mYWxzYQ==")).toBe(false)
  })

  it("retorna false pra uma assinatura vazia, sem lançar exceção", () => {
    expect(verifySignature(hashOf("conteúdo qualquer"), "")).toBe(false)
  })
})
