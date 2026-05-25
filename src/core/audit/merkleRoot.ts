// @ts-nocheck
import crypto from "crypto";

function sha256(data: string) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export function buildMerkleRoot(hashes: string[]): string {

  if (hashes.length === 0) {
    return sha256("EMPTY_TREE");
  }

  let layer = hashes;

  while (layer.length > 1) {

    const nextLayer: string[] = [];

    for (let i = 0; i < layer.length; i += 2) {

      if (i + 1 === layer.length) {
        nextLayer.push(sha256(layer[i] + layer[i]));
      } else {
        nextLayer.push(sha256(layer[i] + layer[i + 1]));
      }

    }

    layer = nextLayer;
  }

  return layer[0];
}
