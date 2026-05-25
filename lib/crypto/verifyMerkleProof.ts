// @ts-nocheck
import crypto from "crypto"

/* =========================
   TYPES
========================= */

export type MerkleProofNode =
  | string
  | {
      position?: "left" | "right"
      side?: "left" | "right"
      direction?: "left" | "right"
      hash?: string
      sibling?: string
      value?: string
    }

export type VerifyMerkleProofInput = {
  leaf: string
  proof: MerkleProofNode[]
  root: string

  /**
   * ordered:
   *   usa posição explícita do proof node.
   *   Este é o modo correto para batch Merkle determinístico.
   *
   * sorted:
   *   ordena lexicograficamente o par antes de hashear.
   *   Use apenas para árvores legadas.
   *
   * auto:
   *   usa posição quando existir; se não existir, cai para sorted.
   */
  mode?: "ordered" | "sorted" | "auto"
}

export type VerifyMerkleProofResult = {
  valid: boolean
  computedRoot: string | null
  normalizedLeaf: string | null
  normalizedRoot: string | null
  depth: number
  error?: string
}

/* =========================
   HASH HELPERS
========================= */

function normalizeHex(value: unknown): string | null {
  if (typeof value !== "string") return null
  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return normalized || null
}

function isHex64(value: string | null | undefined): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value)
}

function hashPairBytes(left: string, right: string): string {
  return crypto
    .createHash("sha256")
    .update(
      Buffer.concat([
        Buffer.from(left, "hex"),
        Buffer.from(right, "hex")
      ])
    )
    .digest("hex")
}

function hashPairSorted(left: string, right: string): string {
  return left <= right
    ? hashPairBytes(left, right)
    : hashPairBytes(right, left)
}

/* =========================
   PROOF HELPERS
========================= */

function normalizeProofNode(
  node: unknown
): { hash: string; position?: "left" | "right" } | null {
  if (typeof node === "string") {
    const hash = normalizeHex(node)
    return isHex64(hash) ? { hash } : null
  }

  if (!node || typeof node !== "object" || Array.isArray(node)) {
    return null
  }

  const record = node as {
    hash?: unknown
    sibling?: unknown
    value?: unknown
    position?: unknown
    side?: unknown
    direction?: unknown
  }

  const hash = normalizeHex(record.hash ?? record.sibling ?? record.value)
  if (!isHex64(hash)) return null

  const rawPosition = record.position ?? record.side ?? record.direction

  const position =
    rawPosition === "left" || rawPosition === "right"
      ? rawPosition
      : undefined

  return { hash, position }
}

/* =========================
   CORE
========================= */

function computeMerkleRoot(input: VerifyMerkleProofInput): {
  computedRoot: string | null
  depth: number
  error?: string
} {
  const normalizedLeaf = normalizeHex(input.leaf)
  const normalizedRoot = normalizeHex(input.root)

  if (!isHex64(normalizedLeaf)) {
    return {
      computedRoot: null,
      depth: 0,
      error: "INVALID_LEAF"
    }
  }

  if (!isHex64(normalizedRoot)) {
    return {
      computedRoot: null,
      depth: 0,
      error: "INVALID_ROOT"
    }
  }

  if (!Array.isArray(input.proof)) {
    return {
      computedRoot: null,
      depth: 0,
      error: "INVALID_PROOF"
    }
  }

  if (input.proof.length === 0) {
    return {
      computedRoot: normalizedLeaf,
      depth: 0
    }
  }

  const mode = input.mode ?? "ordered"

  let current = normalizedLeaf
  let depth = 0

  for (const rawNode of input.proof) {
    const node = normalizeProofNode(rawNode)

    if (!node) {
      return {
        computedRoot: null,
        depth,
        error: "INVALID_PROOF_NODE"
      }
    }

    if (mode === "ordered") {
      if (!node.position) {
        return {
          computedRoot: null,
          depth,
          error: "MISSING_NODE_POSITION"
        }
      }

      current =
        node.position === "left"
          ? hashPairBytes(node.hash, current)
          : hashPairBytes(current, node.hash)

      depth += 1
      continue
    }

    if (mode === "sorted") {
      current = hashPairSorted(current, node.hash)
      depth += 1
      continue
    }

    // auto
    if (node.position === "left") {
      current = hashPairBytes(node.hash, current)
    } else if (node.position === "right") {
      current = hashPairBytes(current, node.hash)
    } else {
      current = hashPairSorted(current, node.hash)
    }

    depth += 1
  }

  return {
    computedRoot: current,
    depth
  }
}

/* =========================
   PUBLIC API
========================= */

export function verifyMerkleProofDetailed(
  input: VerifyMerkleProofInput
): VerifyMerkleProofResult {
  const normalizedLeaf = normalizeHex(input.leaf)
  const normalizedRoot = normalizeHex(input.root)
  const result = computeMerkleRoot(input)

  return {
    valid:
      isHex64(normalizedRoot) &&
      isHex64(result.computedRoot) &&
      result.computedRoot === normalizedRoot,
    computedRoot: result.computedRoot,
    normalizedLeaf,
    normalizedRoot,
    depth: result.depth,
    error: result.error
  }
}

export function verifyMerkleProof(input: VerifyMerkleProofInput): boolean {
  return verifyMerkleProofDetailed(input).valid
}
