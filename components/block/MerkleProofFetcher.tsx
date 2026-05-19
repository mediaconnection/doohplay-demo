"use client"

import { useEffect, useState } from "react"
import MerkleProofView from "@/components/merkle/MerkleProofView"

export default function MerkleProofFetcher({
  hash,
  root
}: {
  hash: string
  root: string
}) {

  const [proof, setProof] = useState<any[]>([])

  useEffect(() => {
    fetch(`/api/audit/event/${hash}`)
      .then(res => res.json())
      .then(data => {
        setProof(data.merkle_proof || [])
      })
  }, [hash])

  if (!proof.length) return null

  return (
    <MerkleProofView
      leaf={hash}
      proof={proof}
      root={root}
    />
  )
}