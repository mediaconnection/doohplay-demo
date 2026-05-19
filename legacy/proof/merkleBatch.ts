import crypto from "crypto"

export type MerkleProofPosition = "left" | "right"

export type MerkleProofItem = {
  position: MerkleProofPosition
  hash: string
}

/* =========================
   HASH HELPERS
========================= */

function sha256(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex")
}

export function normalizeHash(value?: string | null): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^0x/, "")
}

export function with0x(value?: string | null): string {
  const clean = normalizeHash(value)
  return clean ? `0x${clean}` : ""
}

export function isHex64(value?: string | null): boolean {
  return /^[a-f0-9]{64}$/.test(normalizeHash(value))
}

/* =========================
   MERKLE NODE
========================= */

/**
 * IMPORTANTE:
 * Este algoritmo precisa ser igual ao worker que gera event_blocks.merkle_root.
 *
 * Domain separation:
 * 0x01 = internal node
 */
export function hashMerkleNode(left: string, right: string): string {
  const l = normalizeHash(left)
  const r = normalizeHash(right)

  if (!isHex64(l) || !isHex64(r)) {
    throw new Error("INVALID_MERKLE_NODE_HASH")
  }

  return sha256(
    Buffer.concat([
      Buffer.from([0x01]),
      Buffer.from(l, "hex"),
      Buffer.from(r, "hex")
    ])
  )
}

/* =========================
   ROOT
========================= */

export function buildMerkleRoot(leaves: string[]): string | null {
  let level = leaves.map(normalizeHash).filter(isHex64)

  if (!level.length) return null

  while (level.length > 1) {
    const next: string[] = []

    for (let i = 0; i < level.length; i += 2) {
      const left = level[i]
      const right = level[i + 1] || left

      next.push(hashMerkleNode(left, right))
    }

    level = next
  }

  return level[0]
}

/* =========================
   PROOF
========================= */

export function buildMerkleProof(
  leaves: string[],
  targetHash: string
): MerkleProofItem[] | null {
  let level = leaves.map(normalizeHash).filter(isHex64)
  let index = level.indexOf(normalizeHash(targetHash))

  if (index < 0) return null

  const proof: MerkleProofItem[] = []

  while (level.length > 1) {
    const next: string[] = []

    for (let i = 0; i < level.length; i += 2) {
      const left = level[i]
      const right = level[i + 1] || left

      next.push(hashMerkleNode(left, right))

      if (i === index || i + 1 === index) {
        const targetIsLeft = index === i

        proof.push({
          position: targetIsLeft ? "right" : "left",
          hash: targetIsLeft ? right : left
        })

        index = next.length - 1
      }
    }

    level = next
  }

  return proof
}

export function verifyMerkleProofFromBatch(
  eventHash: string,
  merkleRoot: string,
  proof: MerkleProofItem[] | null | undefined
): {
  valid: boolean
  computed_root: string | null
  expected_root: string
  reason?: string
} {
  let computed = normalizeHash(eventHash)
  const expected = normalizeHash(merkleRoot)

  if (!isHex64(computed)) {
    return {
      valid: false,
      computed_root: null,
      expected_root: expected,
      reason: "INVALID_EVENT_HASH"
    }
  }

  if (!isHex64(expected)) {
    return {
      valid: false,
      computed_root: computed,
      expected_root: expected,
      reason: "INVALID_MERKLE_ROOT"
    }
  }

  if (!Array.isArray(proof)) {
    return {
      valid: computed === expected,
      computed_root: computed,
      expected_root: expected,
      reason: computed === expected ? undefined : "MERKLE_PROOF_MISSING"
    }
  }

  for (const item of proof) {
    const sibling = normalizeHash(item.hash)

    if (!isHex64(sibling)) {
      return {
        valid: false,
        computed_root: computed,
        expected_root: expected,
        reason: "INVALID_PROOF_NODE"
      }
    }

    computed =
      item.position === "left"
        ? hashMerkleNode(sibling, computed)
        : hashMerkleNode(computed, sibling)
  }

  return {
    valid: computed === expected,
    computed_root: computed,
    expected_root: expected,
    reason: computed === expected ? undefined : "MERKLE_ROOT_MISMATCH"
  }
}