"use client"

import { useState } from "react"

import { verifyMerkleProof } from "@/lib/merkle"
import { verifySignatureBrowser } from "@/lib/crypto/verifySignatureBrowser"

type ProofNode = {
  hash: string
  position: "left" | "right"
}

type ProofFile = {
  event_hash: string
  merkle_root: string
  proof: ProofNode[]
  signature?: string
}

function isValidHash(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[a-f0-9]{64}$/i.test(value.trim().replace(/^0x/i, ""))
  )
}

function normalizeHash(value: string): string {
  return value.trim().toLowerCase().replace(/^0x/, "")
}

function isProofNode(value: unknown): value is ProofNode {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false
  }

  const node = value as Partial<ProofNode>

  return (
    isValidHash(node.hash) &&
    (node.position === "left" || node.position === "right")
  )
}

function parseProofFile(value: unknown): ProofFile | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }

  const record = value as Partial<ProofFile>

  if (!isValidHash(record.event_hash)) return null
  if (!isValidHash(record.merkle_root)) return null
  if (!Array.isArray(record.proof)) return null

  const proof = record.proof.filter(isProofNode)

  if (proof.length !== record.proof.length) return null

  return {
    event_hash: normalizeHash(record.event_hash),
    merkle_root: normalizeHash(record.merkle_root),
    proof: proof.map((node) => ({
      hash: normalizeHash(node.hash),
      position: node.position
    })),
    signature:
      typeof record.signature === "string" && record.signature.trim()
        ? record.signature.trim()
        : undefined
  }
}

export default function OfflineVerifyPage() {
  const [result, setResult] = useState<string>("")
  const [loading, setLoading] = useState(false)

  async function handleFile(file: File) {
    setLoading(true)
    setResult("")

    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as unknown
      const data = parseProofFile(parsed)

      if (!data) {
        setResult("❌ Invalid proof file format")
        return
      }

      const merkleValid = verifyMerkleProof({
        leaf: data.event_hash,
        proof: data.proof,
        root: data.merkle_root
      })

      let signatureValid: boolean | null = null

      if (data.signature) {
        const res = await fetch("/api/crypto/public-key", {
          cache: "no-store"
        })

        if (!res.ok) {
          throw new Error("PUBLIC_KEY_FETCH_FAILED")
        }

        const json = (await res.json()) as { public_key?: unknown }
        const publicKey =
          typeof json.public_key === "string" ? json.public_key : null

        if (!publicKey) {
          throw new Error("PUBLIC_KEY_MISSING")
        }

        signatureValid = await verifySignatureBrowser(
          data.event_hash,
          data.signature,
          publicKey
        )
      }

      if (merkleValid && (signatureValid ?? true)) {
        setResult("✔ Proof is VALID (offline verified)")
      } else {
        setResult("✖ Invalid proof")
      }
    } catch (err) {
      console.error("OFFLINE_VERIFY_ERROR", err)
      setResult("❌ Invalid file format")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl p-10">
      <h1 className="mb-6 text-2xl font-bold">Offline Verification</h1>

      <input
        type="file"
        accept="application/json"
        onChange={(event) => {
          const file = event.target.files?.[0]

          if (file) {
            void handleFile(file)
          }
        }}
      />

      {loading ? <div className="mt-4 text-gray-500">Verifying...</div> : null}

      {result ? (
        <div className="mt-6 text-lg font-semibold">{result}</div>
      ) : null}
    </div>
  )
}