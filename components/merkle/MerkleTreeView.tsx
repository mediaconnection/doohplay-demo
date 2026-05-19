"use client"

type Props = {
  leaves: string[]
}

function hashPair(a: string, b: string) {
  return btoa(a + b).slice(0, 16) // simplificado visual (não criptográfico)
}

function buildTree(leaves: string[]) {
  const levels: string[][] = []

  let current = leaves
  levels.push(current)

  while (current.length > 1) {
    const next: string[] = []

    for (let i = 0; i < current.length; i += 2) {
      const left = current[i]
      const right = current[i + 1] || left

      next.push(hashPair(left, right))
    }

    levels.unshift(next)
    current = next
  }

  return levels
}

export default function MerkleTreeView({ leaves }: Props) {

  if (!leaves || leaves.length === 0) {
    return <div>No tree data</div>
  }

  const tree = buildTree(leaves)

  return (
    <div className="mt-10 space-y-6">

      {tree.map((level, i) => (
        <div key={i} className="flex justify-center gap-4">

          {level.map((node, j) => (
            <div
              key={j}
              className="bg-gray-100 px-3 py-2 rounded text-xs font-mono"
            >
              {node.slice(0, 10)}...
            </div>
          ))}

        </div>
      ))}

    </div>
  )
}