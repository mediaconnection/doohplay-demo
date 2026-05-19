import crypto from "crypto"

export function verifyBlockHash(
  prevHash: string | null,
  merkleRoot: string,
  blockHash: string
): boolean {
  const computed = crypto
    .createHash("sha256")
    .update((prevHash || "") + merkleRoot)
    .digest("hex")

  return computed === blockHash
}