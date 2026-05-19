"use client"

type ProofStep = {
  hash: string
}

type Props = {
  leaf: string
  root: string
  proof: ProofStep[]
}

function short(hash: string) {
  return hash.slice(0, 8) + "..."
}

export default function MerkleViewer({
  leaf,
  root,
  proof
}: Props) {

  return (
    <div className="space-y-3 font-mono text-xs">

      {/* LEAF */}

      <div className="p-3 bg-blue-50 border rounded">
        <div className="text-gray-500">Leaf</div>
        <div>{short(leaf)}</div>
      </div>

      {/* PROOF STEPS */}

      {proof.map((step, i) => (
        <div key={i} className="flex items-center gap-2">

          <div className="w-6 text-center text-gray-400">↓</div>

          <div className="flex-1 p-3 bg-gray-50 border rounded">
            <div className="text-gray-500">
              Step {i + 1}
            </div>
            <div>{short(step.hash)}</div>
          </div>

        </div>
      ))}

      {/* ROOT */}

      <div className="p-3 bg-green-50 border rounded">
        <div className="text-gray-500">Merkle Root</div>
        <div>{short(root)}</div>
      </div>

    </div>
  )
}