import { verifyEventHash } from "@/lib/crypto/ledgerVerify";
import { verifyMerkleProof } from "@/lib/proof/merkle/verifyMerkleProof";
import { verifyLedgerBlock } from "@/lib/crypto/verifyLedgerBlock";

type LedgerEvent = {
  event_hash: string | null;
  merkle_root: string | null;
  merkle_proof?: any[];
  signature?: string | null;
};

type LedgerBlock = {
  block_height: number;
  block_hash: string;
  previous_hash: string | null;
  merkle_root: string;
};

export type LedgerProofResult = {

  event_hash_valid: boolean;
  merkle_valid?: boolean;
  block_valid?: boolean;
  chain_valid?: boolean;
  signature_valid?: boolean;

  valid: boolean;

};

export function verifyLedgerEventProof(
  event: LedgerEvent,
  block?: LedgerBlock
): LedgerProofResult {

  const event_hash_valid =
    event.event_hash
      ? verifyEventHash(event)
      : false;

  let merkle_valid = false;

  if (
    event.event_hash &&
    event.merkle_root &&
    event.merkle_proof
  ) {

    const _mvr = verifyMerkleProof(
      event.event_hash,
      event.merkle_proof,
      event.merkle_root
    );
    merkle_valid = typeof _mvr === "boolean" ? _mvr : _mvr.valid

  }

  let block_valid = false;

  if (block) {
    block_valid = verifyLedgerBlock(block);
  }

  const valid =
    event_hash_valid &&
    (merkle_valid || event.merkle_proof == null) &&
    (block_valid || block == null);

  return {

    event_hash_valid,
    merkle_valid,
    block_valid,
    chain_valid: undefined,
    signature_valid: undefined,

    valid

  };

}
