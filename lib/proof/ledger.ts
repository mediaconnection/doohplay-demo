import crypto from "crypto"

function normalizeHash(value?: string | null): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^0x/, "")
}

export function buildLedgerHash(
  previousHash: string | null,
  merkleRoot: string
): string {
  const prev = previousHash ? normalizeHash(previousHash) : "GENESIS"
  const root = normalizeHash(merkleRoot)

  return crypto
    .createHash("sha256")
    .update(`${prev}:${root}`, "utf8")
    .digest("hex")
}