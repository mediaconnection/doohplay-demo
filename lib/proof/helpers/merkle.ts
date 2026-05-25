// @ts-nocheck
import { normalizeHex, sha256Hex } from "./hash"

export type MerkleProofNode =
  | string
  | {
      position?: "left" | "right"
      hash: string
    }

function concatHashes(left: string, right: string): string {
  return sha256Hex(normalizeHex(left) + normalizeHex(right))
}

export function computeMerkleRootFromProof(
  leafHash: string,
  proof: MerkleProofNode[]
): string {
  let current = normalizeHex(leafHash)

  for (const item of proof) {
    if (typeof item === "string") {
      const sibling = normalizeHex(item)

      // fallback determinístico se posição não vier informada
      current =
        current <= sibling
          ? concatHashes(current, sibling)
          : concatHashes(sibling, current)

      continue
    }

    const sibling = normalizeHex(item.hash)
    const position = item.position

    if (position === "left") {
      current = concatHashes(sibling, current)
    } else if (position === "right") {
      current = concatHashes(current, sibling)
    } else {
      current =
        current <= sibling
          ? concatHashes(current, sibling)
          : concatHashes(sibling, current)
    }
  }

  return normalizeHex(current)
}

export function verifyMerkleProof(params: {
  leafHash: string
  proof: MerkleProofNode[]
  expectedRoot: string
}): boolean {
  const computed = computeMerkleRootFromProof(
    params.leafHash,
    params.proof
  )

  return computed === normalizeHex(params.expectedRoot)
}
