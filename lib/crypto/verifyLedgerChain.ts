// @ts-nocheck
import { sha256 } from "@/lib/crypto/hash";

type LedgerBlock = {
  block_height: number;
  block_hash: string;
  previous_hash: string | null;
  merkle_root: string;
};

export function verifyLedgerBlock(block: LedgerBlock) {

  const calculated = sha256(
    JSON.stringify({
      block_height: block.block_height,
      previous_hash: block.previous_hash,
      merkle_root: block.merkle_root
    })
  );

  return calculated === block.block_hash;

}

export function verifyLedgerChain(blocks: LedgerBlock[]) {

  if (!Array.isArray(blocks) || blocks.length === 0) {
    return {
      valid: false,
      error: "Empty chain"
    };
  }

  for (let i = 1; i < blocks.length; i++) {

    const previous = blocks[i - 1];
    const current = blocks[i];

    if (current.previous_hash !== previous.block_hash) {

      return {
        valid: false,
        error: "Broken chain",
        block_height: current.block_height
      };

    }

    if (!verifyLedgerBlock(current)) {

      return {
        valid: false,
        error: "Invalid block hash",
        block_height: current.block_height
      };

    }

  }

  return {
    valid: true
  };

}
