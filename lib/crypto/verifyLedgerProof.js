const { verifyEventHash } = require("./ledgerVerify");
const { verifyMerkleProof } = require("./verifyMerkleProof");
const { verifySignature } = require("./signature");

/**
 * Verifica completamente um evento do ledger
 */
function verifyLedgerEventProof({

  event,
  merkle_root,
  merkle_proof,
  public_key

}) {

  const result = {
    event_hash_valid: false,
    merkle_valid: false,
    signature_valid: false,
    valid: false
  };

  // 1️⃣ verificar hash do evento
  result.event_hash_valid = verifyEventHash(event);

  // 2️⃣ verificar merkle proof
  if (event.event_hash && merkle_root) {

    try {

      result.merkle_valid = verifyMerkleProof(
        event.event_hash,
        merkle_proof,
        merkle_root
      );

    } catch {

      result.merkle_valid = false;

    }

  }

  // 3️⃣ verificar assinatura
  if (event.signature && public_key) {

    try {

      result.signature_valid = verifySignature(
        public_key,
        event.event_hash,
        event.signature
      );

    } catch {

      result.signature_valid = false;

    }

  }

  result.valid =
    result.event_hash_valid &&
    result.merkle_valid &&
    result.signature_valid;

  return result;

}

module.exports = { verifyLedgerEventProof };