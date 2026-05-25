// @ts-nocheck
import { sha256 } from "./hash";

type Block = {
  block_height: number;
  block_hash: string;
  previous_hash: string | null;
  merkle_root: string;
};

export function verifyBlock(block: Block) {

  const calculated = sha256(
    JSON.stringify({
      block_height: block.block_height,
      previous_hash: block.previous_hash,
      merkle_root: block.merkle_root
    })
  );

  return calculated === block.block_hash;

}
