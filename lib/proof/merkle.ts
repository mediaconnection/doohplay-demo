import crypto from "crypto";

export function sha256(data: string) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export function buildMerkleTree(hashes: string[]) {

  if (hashes.length === 0) return null;

  let level = hashes;

  while (level.length > 1) {

    const nextLevel = [];

    for (let i = 0; i < level.length; i += 2) {

      const left = level[i];
      const right = level[i + 1] || left;

      nextLevel.push(sha256(left + right));
    }

    level = nextLevel;
  }

  return level[0];
}

export const buildMerkleRoot = buildMerkleTree
export { generateMerkleProof as buildMerkleProof } from "@/lib/crypto/merkleRoot"
