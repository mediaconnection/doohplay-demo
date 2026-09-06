import { verifySignature } from "../../packages/proof-engine/legacy/proof/signature"

type Input = {
  message: string
  signatures: {
    signer: string
    signature: string
  }[]
  required: number
}

export function verifyMultiSignature({
  message,
  signatures,
  required
}: Input) {
  let validCount = 0
  const validSigners: string[] = []

  for (const item of signatures) {
    try {
      const ok = verifySignature(message, item.signature, {
        encoding: "hex"
      })

      if (ok) {
        validCount += 1
        validSigners.push(item.signer)
      }
    } catch {
      // assinatura inválida: ignora e continua
    }
  }

  return {
    valid: validCount >= required,
    validCount,
    required,
    validSigners
  }
}