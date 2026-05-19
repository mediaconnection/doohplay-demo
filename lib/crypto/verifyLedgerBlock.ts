import { sha256 } from "./hash";

type Block = {
  block_height: number;
  previous_hash: string | null;
  merkle_root: string;
  block_hash: string;
};

export function verifyLedgerBlock(block: Block) {

  if (!block) return false;

  const calculatedHash = sha256(
    JSON.stringify({
      block_height: block.block_height,
      previous_hash: block.previous_hash,
      merkle_root: block.merkle_root
    })
  );

  return calculatedHash === block.block_hash;

}