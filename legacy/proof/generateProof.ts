import crypto from "crypto"

import { buildMerkleTree } from "./merkle"
import { hashProof } from "./hash"
import { getActiveKey } from "./keyRegistry"

type GenerateProofInput = {
  data: unknown[]
}

type Signer = {
  sign(payload: string): Promise<string>
}

function createFallbackSigner(keyId: string): Signer {
  return {
    async sign(payload: string): Promise<string> {
      return crypto
        .createHmac("sha256", process.env.PROOF_SIGNING_SECRET ?? keyId)
        .update(payload)
        .digest("hex")
    }
  }
}

export async function generateProof(input: GenerateProofInput) {
  const { data } = input

  const hashes = data.map((item) => hashProof(item))
  const root = buildMerkleTree(hashes)

  if (!root) {
    throw new Error("Failed to generate merkle root")
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const payload = `${root}:${timestamp}`

  const { keyId } = getActiveKey()
  const signer = createFallbackSigner(keyId)

  const signature = await signer.sign(payload)

  return {
    root,
    merkle_root: root,
    signature,
    keyId,
    timestamp,
    total: hashes.length
  }
}