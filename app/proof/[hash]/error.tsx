"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { trackError } from "@/lib/observability/analytics"

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {

  const router = useRouter()

  /* =========================
     LOG + TRACKING
  ========================= */

  useEffect(() => {
    console.error("PROOF_PAGE_ERROR:", error)

    trackError("proof_page_error", {
      message: error.message,
      stack: error.stack
    })

    toast.error("Erro ao carregar prova")
  }, [error])

  /* =========================
     RETRY HANDLER
  ========================= */

  function handleRetry() {
    try {
      reset()
    } catch {
      toast.error("Não foi possível tentar novamente")
    }
  }

  /* =========================
     NAVIGATION
  ========================= */

  function handleBack() {
    router.push("/")
  }

  return (
    <main className="max-w-2xl mx-auto p-6 text-center space-y-6">

      {/* ICON */}
      <div className="text-5xl">❌</div>

      {/* TITLE */}
      <h1 className="text-xl font-bold text-red-600">
        Erro ao carregar prova
      </h1>

      {/* DESCRIPTION */}
      <p className="text-gray-600">
        Não foi possível verificar esta prova no momento.
      </p>

      {/* POSSÍVEIS CAUSAS */}
      <ul className="text-sm text-gray-500 space-y-1">
        <li>• Hash inválido ou inexistente</li>
        <li>• Erro temporário no sistema</li>
        <li>• Problema de conexão</li>
      </ul>

      {/* ACTIONS */}
      <div className="flex justify-center gap-4 mt-4">

        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Tentar novamente
        </button>

        <button
          onClick={handleBack}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Voltar
        </button>

      </div>

      {/* DEBUG (dev only) */}
      {process.env.NODE_ENV === "development" && (
        <pre className="mt-6 text-left bg-gray-100 p-3 rounded text-xs overflow-x-auto">
          {JSON.stringify(
            {
              message: error.message,
              stack: error.stack
            },
            null,
            2
          )}
        </pre>
      )}
    </main>
  )
}