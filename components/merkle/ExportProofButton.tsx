"use client"

import { verifyMerkleProof } from "@/lib/merkle"

type ProofNode = {
  hash: string
  position: "left" | "right"
}

type ExportProofButtonProps = {
  leaf: string
  proof: ProofNode[]
  root: string
}

export default function ExportProofButton({
  leaf,
  proof,
  root
}: ExportProofButtonProps) {
  function download() {
    const verified = verifyMerkleProof({
      leaf,
      proof,
      root
    })

    const data = {
      event_hash: leaf,
      merkle_root: root,
      proof,
      verified,
      exported_at: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    })

    const url = URL.createObjectURL(blob)

    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `proof-${leaf.slice(0, 10)}.json`
    anchor.click()

    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={download}
      className="mt-4 rounded bg-blue-600 px-3 py-2 text-white"
    >
      Download Proof JSON
    </button>
  )
}