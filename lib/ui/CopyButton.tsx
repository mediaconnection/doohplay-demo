"use client"

import { copyWithFeedback } from "@/lib/ui/copy"
import { toast } from "sonner"

export function CopyButton({
  value,
  label = "Copiar"
}: {
  value: string
  label?: string
}) {

  async function handleCopy() {
    await copyWithFeedback(value, {
      onSuccess: () => toast.success("Copiado"),
      onError: () => toast.error("Erro ao copiar")
    })
  }

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
    >
      {label}
    </button>
  )
}