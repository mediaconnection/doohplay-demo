import crypto from "crypto"

/* =========================
   HELPERS
========================= */

export function normalizeHex(value?: string | null): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^0x/, "")
}

export function isValidHash(value?: string | null): boolean {
  return /^[a-f0-9]{64}$/.test(normalizeHex(value))
}

/* =========================
   SHA256
========================= */

export function sha256(data: string | Buffer): string {
  return crypto.createHash("sha256").update(data).digest("hex")
}

/* =========================
   HASH LEAF
========================= */

export function hashLeaf(data: string | Buffer): string {
  const buffer =
    typeof data === "string"
      ? Buffer.from(normalizeHex(data), isValidHash(data) ? "hex" : "utf8")
      : data

  return sha256(Buffer.concat([Buffer.from([0x00]), buffer]))
}

/* =========================
   HASH PAIR / MERKLE NODE
   Compatível com DOOHPLAY:
   sha256(0x01 + left + right)
========================= */

export function hashPair(left: string, right: string): string {
  if (!isValidHash(left) || !isValidHash(right)) {
    throw new Error("INVALID_HASH_INPUT")
  }

  return sha256(
    Buffer.concat([
      Buffer.from([0x01]),
      Buffer.from(normalizeHex(left), "hex"),
      Buffer.from(normalizeHex(right), "hex")
    ])
  )
}