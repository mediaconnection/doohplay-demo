"use client"

import { useMemo, useState } from "react"

import ExportProofButton from "./ExportProofButton"

type ProofNode =
  | string
  | {
      hash?: string
      position?: "left" | "right"
      sibling?: string
      value?: string
    }

type NormalizedProofNode = {
  hash: string
  position: "left" | "right"
}

type VerificationStep = {
  index: number
  position: "left" | "right"
  current: string
  sibling: string
  result: string
}

function normalizeHash(hash?: string | null): string {
  return String(hash ?? "").trim().toLowerCase().replace(/^0x/, "")
}

function formatHash(hash?: string | null): string {
  const normalized = normalizeHash(hash)
  return normalized ? `0x${normalized}` : ""
}

function isValidHash(hash?: string | null): boolean {
  return /^[a-f0-9]{64}$/i.test(normalizeHash(hash))
}

function shortHash(hash?: string | null, start = 18, end = 10): string {
  const formatted = formatHash(hash)

  if (!formatted) return "—"
  if (formatted.length <= start + end + 3) return formatted

  return `${formatted.slice(0, start)}...${formatted.slice(-end)}`
}

function hexToBytes(hex: string): Uint8Array {
  const normalized = normalizeHash(hex)

  if (!/^[a-f0-9]{64}$/i.test(normalized)) {
    throw new Error("INVALID_HEX_HASH")
  }

  const bytes = new Uint8Array(normalized.length / 2)

  for (let i = 0; i < normalized.length; i += 2) {
    bytes[i / 2] = Number.parseInt(normalized.slice(i, i + 2), 16)
  }

  return bytes
}

function concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  const result = new Uint8Array(a.length + b.length)
  result.set(a, 0)
  result.set(b, a.length)
  return result
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", toArrayBuffer(bytes))

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

function normalizeProof(proof?: ProofNode[] | null): NormalizedProofNode[] {
  if (!Array.isArray(proof)) return []

  return proof
    .map((item): NormalizedProofNode | null => {
      if (typeof item === "string") {
        const hash = formatHash(item)
        return isValidHash(hash) ? { hash, position: "right" } : null
      }

      if (!item || typeof item !== "object") return null

      const rawHash = item.hash ?? item.sibling ?? item.value
      const hash = formatHash(rawHash)

      if (!isValidHash(hash)) return null

      return {
        hash,
        position:
          item.position === "left" || item.position === "right"
            ? item.position
            : "right"
      }
    })
    .filter((item): item is NormalizedProofNode => item !== null)
}

async function computeMerkleSteps(
  leaf: string,
  proof: NormalizedProofNode[]
): Promise<{
  computedRoot: string
  steps: VerificationStep[]
}> {
  let current = formatHash(leaf)
  const steps: VerificationStep[] = []

  if (!isValidHash(current)) {
    throw new Error("INVALID_LEAF_HASH")
  }

  for (let index = 0; index < proof.length; index += 1) {
    const node = proof[index]

    if (!isValidHash(node.hash)) {
      throw new Error(`INVALID_PROOF_HASH_AT_${index}`)
    }

    const left =
      node.position === "left" ? hexToBytes(node.hash) : hexToBytes(current)

    const right =
      node.position === "left" ? hexToBytes(current) : hexToBytes(node.hash)

    const result = formatHash(await sha256Hex(concatBytes(left, right)))

    steps.push({
      index,
      position: node.position,
      current,
      sibling: node.hash,
      result
    })

    current = result
  }

  return {
    computedRoot: current,
    steps
  }
}

export default function MerkleProofView({
  leaf,
  proof,
  root
}: {
  leaf: string
  proof: ProofNode[]
  root: string
}) {
  const [valid, setValid] = useState<boolean | null>(null)
  const [computedRoot, setComputedRoot] = useState<string | null>(null)
  const [steps, setSteps] = useState<VerificationStep[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const normalizedLeaf = useMemo(() => formatHash(leaf), [leaf])
  const normalizedRoot = useMemo(() => formatHash(root), [root])
  const normalizedProof = useMemo(() => normalizeProof(proof), [proof])

  async function runVerify() {
    try {
      setLoading(true)
      setError(null)
      setValid(null)
      setComputedRoot(null)
      setSteps([])

      if (!isValidHash(normalizedLeaf)) {
        setError("Invalid leaf hash format.")
        setValid(false)
        return
      }

      if (!isValidHash(normalizedRoot)) {
        setError("Invalid Merkle root format.")
        setValid(false)
        return
      }

      const localResult = await computeMerkleSteps(normalizedLeaf, normalizedProof)

      const locallyValid =
        normalizeHash(localResult.computedRoot) === normalizeHash(normalizedRoot)

      setComputedRoot(localResult.computedRoot)
      setSteps(localResult.steps)
      setValid(locallyValid)
    } catch (err) {
      console.error("❌ Proof verification failed:", err)
      setError(err instanceof Error ? err.message : "Verification error.")
      setValid(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Merkle Proof Verification
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Validação local no navegador: o caminho da prova é recalculado com
            SHA-256(bytes(left) + bytes(right)) e comparado com a Merkle root.
          </p>
        </div>

        {valid !== null ? (
          <span
            className={[
              "rounded-full border px-3 py-1 text-xs font-semibold",
              valid
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            ].join(" ")}
          >
            {valid ? "VALID" : "INVALID"}
          </span>
        ) : null}
      </div>

      <div className="mt-5 space-y-3">
        <HashRow label="Leaf" value={normalizedLeaf} />
        <HashRow label="Expected Root" value={normalizedRoot} />

        {computedRoot ? (
          <HashRow
            label="Computed Root"
            value={computedRoot}
            highlight={
              normalizeHash(computedRoot) === normalizeHash(normalizedRoot)
                ? "success"
                : "danger"
            }
          />
        ) : null}
      </div>

      {normalizedProof.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          Nenhum nó de prova foi fornecido. Isso é normal para blocos com um
          único evento; para blocos com múltiplos eventos, o backend deve
          retornar os siblings da prova Merkle.
        </div>
      ) : (
        <div className="mt-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Proof Path
          </div>

          <div className="mt-3 space-y-2">
            {normalizedProof.map((node: NormalizedProofNode, index: number) => (
              <div
                key={`${node.hash}-${index}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-600">
                    Step {index + 1}
                  </span>

                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase text-slate-600">
                    sibling {node.position}
                  </span>
                </div>

                <div className="mt-2 break-all font-mono text-xs text-slate-900">
                  {shortHash(node.hash)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {steps.length > 0 ? (
        <div className="mt-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Cryptographic Debug Steps
          </div>

          <div className="mt-3 space-y-3">
            {steps.map((step: VerificationStep) => (
              <div
                key={`${step.result}-${step.index}`}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="text-xs font-semibold text-slate-700">
                  Step {step.index + 1}: combine current hash with{" "}
                  {step.position} sibling
                </div>

                <div className="mt-3 space-y-2">
                  <HashRow label="Current" value={step.current} compact />
                  <HashRow label="Sibling" value={step.sibling} compact />
                  <HashRow label="Result" value={step.result} compact />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={runVerify}
          disabled={loading}
          className={[
            "rounded-xl px-4 py-2 text-sm font-semibold text-white transition",
            loading ? "bg-slate-400" : "bg-slate-900 hover:bg-slate-700"
          ].join(" ")}
        >
          {loading ? "Verifying..." : "Verify Proof Locally"}
        </button>

        {normalizedProof.length > 0 && isValidHash(normalizedRoot) ? (
          <ExportProofButton
            leaf={normalizedLeaf}
            proof={normalizedProof}
            root={normalizedRoot}
          />
        ) : null}
      </div>

      {valid !== null ? (
        <div
          className={[
            "mt-4 rounded-2xl border p-4 text-sm font-medium",
            valid
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          ].join(" ")}
        >
          {valid
            ? "✔ Proof VALID — computed locally and matched the expected Merkle root."
            : "✖ Proof INVALID — computed root does not match the expected Merkle root."}
        </div>
      ) : null}

      {error ? (
        <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {error}
        </div>
      ) : null}
    </div>
  )
}

function HashRow({
  label,
  value,
  compact,
  highlight
}: {
  label: string
  value?: string | null
  compact?: boolean
  highlight?: "success" | "danger"
}) {
  return (
    <div
      className={[
        "rounded-2xl border p-3",
        compact ? "bg-slate-50" : "bg-white",
        highlight === "success"
          ? "border-emerald-200 bg-emerald-50"
          : highlight === "danger"
            ? "border-rose-200 bg-rose-50"
            : "border-slate-200"
      ].join(" ")}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>

      <div className="mt-1 break-all font-mono text-xs text-slate-900">
        {value ? shortHash(value, 22, 12) : "—"}
      </div>
    </div>
  )
}