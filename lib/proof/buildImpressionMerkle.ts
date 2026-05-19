import { buildMerkleTree } from "@/lib/crypto/merkle";

export function buildImpressionMerkle(
  hashes: string[]
) {

  return buildMerkleTree(hashes);

}