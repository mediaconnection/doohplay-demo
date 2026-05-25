// @ts-nocheck
import crypto from "crypto"

function sha256(data: string) {
  return crypto
    .createHash("sha256")
    .update(data)
    .digest("hex")
}

export function generateMerkleProof(
  hashes: string[],
  targetHash: string
) {

  let index = hashes.indexOf(targetHash)

  if (index === -1) {
    throw new Error("Hash não encontrado")
  }

  let proof: { hash: string; position: "left" | "right" }[] = []

  let layer = [...hashes]

  while (layer.length > 1) {

    if (layer.length % 2 !== 0) {
      layer.push(layer[layer.length - 1])
    }

    const nextLayer: string[] = []

    for (let i = 0; i < layer.length; i += 2) {

      const left = layer[i]
      const right = layer[i + 1]

      const combined = sha256(left + right)

      nextLayer.push(combined)

      if (i === index || i + 1 === index) {

        if (index === i) {
          proof.push({ hash: right, position: "right" })
        } else {
          proof.push({ hash: left, position: "left" })
        }

        index = Math.floor(i / 2)

      }

    }

    layer = nextLayer

  }

  return proof

}
