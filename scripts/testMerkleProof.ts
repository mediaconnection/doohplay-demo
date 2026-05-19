import { generateMerkleProof } from "../reports/generateMerkleProof"
import { verifyMerkleProof } from "../reports/verifyMerkleProof"
import { generateMerkleRoot } from "../reports/generateMerkleRoot"

const hashes = [
  "a1",
  "b2",
  "c3",
  "d4"
]

const root = generateMerkleRoot(hashes)

const target = hashes[1]

const proof = generateMerkleProof(
  hashes,
  target
)

console.log("Merkle Root:", root)

console.log("Proof:", proof)

const valid = verifyMerkleProof(
  target,
  proof,
  root
)

console.log("Proof válido:", valid)