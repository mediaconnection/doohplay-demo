// @ts-nocheck
import { buildMerkleTree } from "./buildMerkleTree"

export function getMerkleProof(
  leaves: string[],
  targetLeaf: string
) {

  const { tree } = buildMerkleTree(leaves)

  const proof: string[] = []

  let index = leaves.indexOf(targetLeaf)

  if (index === -1) {
    throw new Error("Leaf not found in Merkle tree")
  }

  for (let level = 0; level < tree.length - 1; level++) {

    const layer = tree[level]

    const isRightNode = index % 2

    const pairIndex = isRightNode
      ? index - 1
      : index + 1

    if (pairIndex < layer.length) {
      proof.push(layer[pairIndex])
    }

    index = Math.floor(index / 2)

  }

  return proof

}
