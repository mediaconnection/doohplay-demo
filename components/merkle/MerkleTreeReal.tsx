"use client"

import React, { useEffect, useState } from "react"

type Node = {
  hash: string
  left?: Node
  right?: Node
  parent?: Node
  isPath?: boolean
}

/* =========================
   HASH
========================= */

async function sha256(data: string) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(data)
  )

  return Array.from(new Uint8Array(buf))
    .map(x => x.toString(16).padStart(2, "0"))
    .join("")
}

/* =========================
   BUILD TREE
========================= */

async function buildTree(leaves: string[]) {
  let nodes: Node[] = leaves.map(h => ({ hash: h }))

  while (nodes.length > 1) {
    const next: Node[] = []

    for (let i = 0; i < nodes.length; i += 2) {
      const left = nodes[i]
      const right = nodes[i + 1] || left

      const parentHash = await sha256(left.hash + right.hash)

      const parent: Node = {
        hash: parentHash,
        left,
        right
      }

      left.parent = parent
      right.parent = parent

      next.push(parent)
    }

    nodes = next
  }

  return nodes[0]
}

/* =========================
   CLEAR PATH
========================= */

function clearPath(node: Node) {
  node.isPath = false
  if (node.left) clearPath(node.left)
  if (node.right) clearPath(node.right)
}

/* =========================
   MARK PATH
========================= */

function markPath(node: Node) {
  let current: Node | undefined = node

  while (current) {
    current.isPath = true
    current = current.parent
  }
}

/* =========================
   FIND LEAF
========================= */

function findLeaf(node: Node, hash: string): Node | null {
  if (!node.left && !node.right) {
    return node.hash === hash ? node : null
  }

  return (
    (node.left && findLeaf(node.left, hash)) ||
    (node.right && findLeaf(node.right, hash)) ||
    null
  )
}

/* =========================
   RENDER
========================= */

function TreeNode({
  node,
  onClick
}: {
  node: Node
  onClick: (hash: string) => void
}) {
  return (
    <div className="flex flex-col items-center">

      <div
        onClick={() => onClick(node.hash)}
        className={`px-3 py-1 rounded text-xs font-mono mb-2 cursor-pointer ${
          node.isPath
            ? "bg-green-300"
            : "bg-gray-100"
        }`}
      >
        {node.hash.slice(0, 10)}...
      </div>

      {node.left && node.right && (
        <div className="flex gap-4">
          <TreeNode node={node.left} onClick={onClick} />
          <TreeNode node={node.right} onClick={onClick} />
        </div>
      )}
    </div>
  )
}

/* =========================
   COMPONENT
========================= */

export default function MerkleTreeReal({
  leaves
}: {
  leaves: string[]
}) {

  const [tree, setTree] = useState<Node | null>(null)

  useEffect(() => {
    buildTree(leaves).then(setTree)
  }, [leaves])

  function handleClick(hash: string) {
    if (!tree) return

    clearPath(tree)

    const leaf = findLeaf(tree, hash)

    if (leaf) {
      markPath(leaf)
      setTree({ ...tree })
    }
  }

  if (!tree) return <div>Building tree...</div>

  return (
    <div className="mt-10">
      <TreeNode node={tree} onClick={handleClick} />
    </div>
  )
}