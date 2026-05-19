const { verifyLedgerChain } = require("./ledgerVerify");
const { verifyMerkleProof } = require("./verifyMerkleProof");
const { verifySignature } = require("./signature");

/**
 * Verifica completamente o ledger
 */
function verifyFullLedger({

  events,
  merkle_root,
  public_key

}) {

  const result = {
    chain_valid: false,
    merkle_valid: false,
    signature_valid: false,
    valid: false
  };

  // 1️⃣ verificar cadeia
  const chain = verifyLedgerChain(events);

  result.chain_valid = chain.valid;

  // 2️⃣ verificar Merkle root
  if (events.length > 0 && merkle_root) {

    const last = events[events.length - 1];

    try {

      result.merkle_valid = verifyMerkleProof(
        last.event_hash,
        last.merkle_proof,
        merkle_root
      );

    } catch {

      result.merkle_valid = false;

    }

  }

  // 3️⃣ verificar assinatura
  if (public_key && merkle_root) {

    try {

      result.signature_valid = verifySignature(
        public_key,
        merkle_root,
        events[events.length - 1].signature
      );

    } catch {

      result.signature_valid = false;

    }

  }

  result.valid =
    result.chain_valid &&
    result.merkle_valid &&
    result.signature_valid;

  return result;

}

module.exports = { verifyFullLedger };