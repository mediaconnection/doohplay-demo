// /lib/domain/proof/verifyProof.ts

import crypto from "crypto"

function hash(data: Buffer | string): string {
  return crypto.createHash("sha256").update(data).digest("hex")
}

function hashLeaf(data: string): string {
  return hash(Buffer.concat([
    Buffer.from([0x00]),
    Buffer.from(data, "hex")
  ]))
}

function hashNode(left: string, right: string): string {
  return hash(Buffer.concat([
    Buffer.from([0x01]),
    Buffer.from(left, "hex"),
    Buffer.from(right, "hex")
  ]))
}

type ProofItem = {
  position: "left" | "right"
  hash: string
}

export function verifyMerkleProof(
  leaf: string,
  proof: ProofItem[],
  root: string
): boolean {

  let computed = hashLeaf(leaf)

  for (const step of proof) {
    if (step.position === "left") {
      computed = hashNode(step.hash, computed)
    } else {
      computed = hashNode(computed, step.hash)
    }
  }

  return computed === root
}