import crypto from "crypto"

/* =========================
   HELPERS
========================= */

function normalizeHex(hex: string): string {
  if (!hex || typeof hex !== "string") {
    throw new Error("INVALID_HEX_INPUT")
  }

  return hex.trim().toLowerCase().replace(/^0x/, "")
}

export function isValidHash(hash: string): boolean {
  try {
    const h = normalizeHex(hash)
    return h.length === 64 && /^[a-f0-9]+$/.test(h)
  } catch {
    return false
  }
}

/* =========================
   SHA256
========================= */

export function sha256(data: string | Buffer): string {
  return typeof data === "string"
    ? crypto.createHash("sha256").update(data, "utf8").digest("hex")
    : crypto.createHash("sha256").update(data).digest("hex")
}

/* =========================
   HASH PAIR (NODE)
========================= */

export function hashPair(left: string, right: string): string {
  if (!isValidHash(left) || !isValidHash(right)) {
    throw new Error("INVALID_HASH_INPUT")
  }

  const l = normalizeHex(left)
  const r = normalizeHex(right)

  // 🔥 SORTED TREE (DETERMINÍSTICO)
  const [a, b] = l <= r ? [l, r] : [r, l]

  const combined = Buffer.concat([
    Buffer.from([0x01]), // domain separator (node)
    Buffer.from(a, "hex"),
    Buffer.from(b, "hex"),
  ])

  return sha256(combined)
}

/* =========================
   SAFE COMPARE (CONSTANT TIME)
========================= */

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex")
  const bufB = Buffer.from(b, "hex")

  if (bufA.length !== bufB.length) return false

  return crypto.timingSafeEqual(bufA, bufB)
}

/* =========================
   VERIFY MERKLE PROOF 🔥
========================= */

export function verifyMerkleProof(
  leaf: string,
  proof: Array<string | { hash: string }>,
  root: string
): boolean {

  if (!isValidHash(leaf)) {
    throw new Error("INVALID_LEAF")
  }

  if (!isValidHash(root)) {
    throw new Error("INVALID_ROOT")
  }

  if (!Array.isArray(proof)) {
    throw new Error("INVALID_PROOF")
  }

  let hash = normalizeHex(leaf)

  for (const step of proof) {
    const sibling =
      typeof step === "string"
        ? step
        : step?.hash

    if (!sibling || !isValidHash(sibling)) {
      throw new Error("INVALID_PROOF_STEP")
    }

    hash = hashPair(hash, normalizeHex(sibling))
  }

  return safeEqual(hash, normalizeHex(root))
}

/* =========================
   EXPORTS
========================= */

export { normalizeHex }