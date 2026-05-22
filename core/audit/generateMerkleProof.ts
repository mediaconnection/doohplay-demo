import crypto from "crypto";

function hash(a: string, b: string) {

  return crypto
    .createHash("sha256")
    .update(a + b)
    .digest("hex");

}

export function generateMerkleProof(
  hashes: string[],
  targetHash: string
) {

  let index = hashes.indexOf(targetHash);

  if (index === -1) {
    throw new Error("event hash not found");
  }

  const proof: string[] = [];

  let layer = [...hashes];

  while (layer.length > 1) {

    const nextLayer: string[] = [];

    for (let i = 0; i < layer.length; i += 2) {

      const left = layer[i];
      const right = layer[i + 1] || left;

      const parent = hash(left, right);

      nextLayer.push(parent);

      if (i === index || i + 1 === index) {

        const sibling =
          i === index ? right : left;

        proof.push(sibling);

        index = nextLayer.length - 1;

      }

    }

    layer = nextLayer;

  }

  return {

    merkle_root: layer[0],

    proof

  };

}