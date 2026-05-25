// @ts-nocheck
import { buildMerkleTree } from "@/lib/merkle";

export function buildAudienceMerkle(
  hashes: string[]
) {

  return buildMerkleTree(hashes);

}
