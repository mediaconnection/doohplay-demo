const { sha256, isValidHash } = require("./hash");

/**
 * JSON determinístico (ordena chaves)
 */
function stableStringify(obj) {

  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return `[${obj.map(stableStringify).join(",")}]`;
  }

  const keys = Object.keys(obj).sort();

  const entries = keys.map(
    key => `"${key}":${stableStringify(obj[key])}`
  );

  return `{${entries.join(",")}}`;

}

/**
 * Calcula hash determinístico do evento
 */
function computeEventHash(event) {

  const payload = stableStringify({
    event_type: event.event_type,
    occurred_at: event.occurred_at,
    payload: event.payload
  });

  return sha256(payload);

}

/**
 * Verifica integridade de um evento
 */
function verifyEventHash(event) {

  if (!event || !event.event_hash) {
    return false;
  }

  if (!isValidHash(event.event_hash)) {
    return false;
  }

  const calculated = computeEventHash(event);

  return calculated === event.event_hash.toLowerCase();

}

/**
 * Verifica cadeia do ledger
 */
function verifyLedgerChain(events) {

  if (!Array.isArray(events)) {
    throw new Error("Events inválidos");
  }

  for (let i = 0; i < events.length; i++) {

    const curr = events[i];

    if (!verifyEventHash(curr)) {

      return {
        valid: false,
        error: "Invalid event hash",
        index: i
      };

    }

    if (i > 0) {

      const prev = events[i - 1];

      if (curr.previous_hash !== prev.event_hash) {

        return {
          valid: false,
          error: "Broken chain",
          index: i
        };

      }

    }

  }

  return {
    valid: true
  };

}

module.exports = {
  computeEventHash,
  verifyEventHash,
  verifyLedgerChain
};