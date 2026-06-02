"use client"

import { useState, useEffect } from "react"
// ... outros imports ...

// ... tipos e helpers ...

export default function VerifyPage() {
  const [hash, setHash] = useState("")
  const [data, setData] = useState<VerifyResponse | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isNotFound, setIsNotFound] = useState(false)

  useEffect(() => {
    // ... código do useEffect aqui dentro do componente ...
  }, [])

  // ... resto do JSX ...
}
