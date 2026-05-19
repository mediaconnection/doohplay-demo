
import crypto from "crypto";

export function buildRootHash(buffers: Buffer[]) {
  const hash = crypto.createHash("sha256");

  for (const b of buffers) {
    hash.update(b);
  }

  return hash.digest();
}