"use client"

import { useState } from "react"

type Props = {
  value?: string | null
  className?: string
}

export default function CopyButton({ value, className }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const text = String(value ?? "")
    if (!text) return

    await navigator.clipboard.writeText(text)

    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={className}
    >
      {copied ? "✔ Copiado" : "Copy"}
    </button>
  )
}