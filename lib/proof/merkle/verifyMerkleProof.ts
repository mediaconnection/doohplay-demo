// C:\doohplay\dashboard-web\lib\proof\merkle\verifyMerkleProof.ts

import crypto from "crypto"

/* =========================
   TYPES
========================= */

export type MerkleProofItem =
  | string
  | {
      position?: "left" | "right"
      hash?: string
    }

export type VerifyMerkleProofInput = {
  leaf: string
  proof: MerkleProofItem[]
  root: string
  mode?: "auto" | "strict"
}

export type VerifyMerkleProofResult = {
  valid: boolean
  computedRoot: string
  expectedRoot: string
  depth?: number
  error?: string | null
}

/* =========================
   HELPERS
========================= */

function sha256(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex")
}

function normalizeHex(value: string): string {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/^0x/, "")
}

function isValidHash(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(normalizeHex(value))
}

function hashNode(left: string, right: string): string {
  const leftBuffer = Buffer.from(normalizeHex(left), "hex")
  const rightBuffer = Buffer.from(normalizeHex(right), "hex")

  return sha256(
    Buffer.concat([
      Buffer.from([0x01]),
      leftBuffer,
      rightBuffer
    ])
  )
}

function extractProofItem(
  item: MerkleProofItem
): {
  hash: string
  position: "left" | "right"
} | null {
  if (typeof item === "string") {
    const normalized = normalizeHex(item)

    if (!isValidHash(normalized)) {
      return null
    }

    return {
      hash: normalized,
      position: "right"
    }
  }

  if (!item || typeof item !== "object") {
    return null
  }

  const hash = normalizeHex(item.hash ?? "")

  if (!isValidHash(hash)) {
    return null
  }

  return {
    hash,
    position: item.position === "left" ? "left" : "right"
  }
}

/* =========================
   MAIN
========================= */

export function verifyMerkleProof(
  leafOrInput: string | VerifyMerkleProofInput,
  maybeProof?: MerkleProofItem[],
  maybeRoot?: string
): boolean | VerifyMerkleProofResult {
  let leaf: string
  let proof: MerkleProofItem[]
  let root: string

  if (typeof leafOrInput === "object") {
    leaf = leafOrInput.leaf
    proof = Array.isArray(leafOrInput.proof)
      ? leafOrInput.proof
      : []
    root = leafOrInput.root
  } else {
    leaf = leafOrInput
    proof = Array.isArray(maybeProof)
      ? maybeProof
      : []
    root = maybeRoot ?? ""
  }

  const normalizedLeaf = normalizeHex(leaf)
  const normalizedRoot = normalizeHex(root)

  if (!isValidHash(normalizedLeaf)) {
    return typeof leafOrInput === "object"
      ? {
          valid: false,
          computedRoot: "",
          expectedRoot: normalizedRoot
        }
      : false
  }

  if (!isValidHash(normalizedRoot)) {
    return typeof leafOrInput === "object"
      ? {
          valid: false,
          computedRoot: "",
          expectedRoot: normalizedRoot
        }
      : false
  }

  let computed = normalizedLeaf

  for (const rawItem of proof) {
    const item = extractProofItem(rawItem)

    if (!item) {
      return typeof leafOrInput === "object"
        ? {
            valid: false,
            computedRoot: computed,
            expectedRoot: normalizedRoot
          }
        : false
    }

    computed =
      item.position === "left"
        ? hashNode(item.hash, computed)
        : hashNode(computed, item.hash)
  }

  const valid = computed === normalizedRoot

  if (typeof leafOrInput === "object") {
    return {
      valid,
      computedRoot: computed,
      expectedRoot: normalizedRoot
    }
  }

  return valid
}

export default verifyMerkleProof

export function verifyMerkleProofDetailed(
  input: VerifyMerkleProofInput
): VerifyMerkleProofResult {
  const result = verifyMerkleProof(input)
  if (typeof result === "boolean") {
    return { valid: result, computedRoot: "", expectedRoot: input.root }
  }
  return result
}

export type MerkleProofNode = MerkleProofItem