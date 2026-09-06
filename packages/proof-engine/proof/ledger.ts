// @ts-nocheck
import crypto from "crypto";

export function sha256(data: string) {
  return crypto
    .createHash("sha256")
    .update(data)
    .digest("hex");
}

export function buildLedgerHash(
  previousHash: string | null,
  merkleRoot: string
) {

  const payload = `${previousHash ?? ""}:${merkleRoot}`;

  return sha256(payload);

}
