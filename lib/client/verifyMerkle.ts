// @ts-nocheck
/* =========================
   TYPES
========================= */

type ProofNode = {
  position: "left" | "right"
  hash: string
}

/* =========================
   UTILS
========================= */

function normalize(hash: string): string {
  return hash.toLowerCase().replace(/^0x/, "")
}

function isValidHash(hash: string): boolean {
  return /^[a-f0-9]{64}$/.test(normalize(hash))
}

/* =========================
   HASH
========================= */

export async function sha256Hex(data: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Crypto API not available in this environment")
  }

  const encoder = new TextEncoder()
  const bytes = encoder.encode(data)

  const buffer = await crypto.subtle.digest("SHA-256", bytes)

  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
}

/* =========================
   VERIFY MERKLE (CLIENT)
========================= */

export async function verifyMerkleClient(
  leaf: string,
  proof: ProofNode[],
  root: string
): Promise<boolean> {

  if (!leaf || !root) {
    throw new Error("Missing leaf or root")
  }

  if (!Array.isArray(proof)) {
    throw new Error("Invalid proof format")
  }

  let current = normalize(leaf)
  const normalizedRoot = normalize(root)

  if (!isValidHash(current)) {
    throw new Error("Invalid leaf hash")
  }

  if (!isValidHash(normalizedRoot)) {
    throw new Error("Invalid root hash")
  }

  for (const step of proof) {
    if (!step?.hash || !step?.position) {
      throw new Error("Invalid proof node")
    }

    const sibling = normalize(step.hash)

    if (!isValidHash(sibling)) {
      throw new Error("Invalid sibling hash in proof")
    }

    if (step.position === "left") {
      current = await sha256Hex(sibling + current)
    } else if (step.position === "right") {
      current = await sha256Hex(current + sibling)
    } else {
      throw new Error("Invalid proof position")
    }
  }

  return current === normalizedRoot
}
