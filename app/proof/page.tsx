"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

/* =========================
   CONSTANTS
========================= */

const STORAGE_KEY = "doohplay_proof_history"
const MAX_HISTORY = 8

/* =========================
   HELPERS
========================= */

function isValidHash(value: string) {
  return /^[a-f0-9]{64}$/i.test(value.trim())
}

function normalizeHash(value: string) {
  return value.trim().toLowerCase()
}

function safeLoadHistory(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored)

    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((item): item is string => typeof item === "string")
      .map(normalizeHash)
      .filter(isValidHash)
      .slice(0, MAX_HISTORY)
  } catch {
    return []
  }
}

export default function ProofHomePage() {
  const [hash, setHash] = useState("")
  const [error, setError] = useState("")
  const [history, setHistory] = useState<string[]>([])

  const router = useRouter()

  function saveToHistory(value: string) {
    const normalized = normalizeHash(value)

    setHistory((current) => {
      const updated = [normalized, ...current.filter((item) => item !== normalized)].slice(
        0,
        MAX_HISTORY
      )

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  function handleOpenProof(value?: string) {
    const target = normalizeHash(value ?? hash)

    if (!target) {
      setError("Informe um hash.")
      return
    }

    if (!isValidHash(target)) {
      setError("Hash inválido. Informe um SHA-256 com 64 caracteres hexadecimais.")
      return
    }

    setError("")
    saveToHistory(target)
    router.push(`/proof/${target}`)
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText()
      const normalized = normalizeHash(text)

      if (!normalized) {
        setError("A área de transferência está vazia.")
        return
      }

      setHash(normalized)

      if (!isValidHash(normalized)) {
        setError("O conteúdo colado não é um hash SHA-256 válido.")
        return
      }

      setError("")
    } catch {
      setError("Não foi possível acessar a área de transferência.")
    }
  }

  function useDemo() {
    const demoHash =
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

    setHash(demoHash)
    setError("")
    handleOpenProof(demoHash)
  }

  function clearHistory() {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
    setError("")
  }

  useEffect(() => {
    setHistory(safeLoadHistory())
  }, [])

  const recentItems = useMemo(() => history.slice(0, MAX_HISTORY), [history])

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-zinc-50 px-6 py-12">
      <main className="w-full max-w-5xl">
        <div className="space-y-10 rounded-3xl border bg-white px-6 py-12 shadow-sm md:px-10">
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-black hover:underline"
              >
                ← Voltar ao portal
              </Link>
            </div>

            <h1 className="text-4xl font-bold tracking-tight">Proof Explorer</h1>

            <p className="mx-auto max-w-2xl text-sm text-gray-500">
              Entrada técnica para consulta de prova criptográfica, integridade,
              cadeia, âncora blockchain e trilha de auditoria.
            </p>
          </div>

          <div className="mx-auto max-w-2xl space-y-3">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleOpenProof()
              }}
              className="space-y-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={hash}
                  onChange={(e) => {
                    setHash(e.target.value)
                    if (error) setError("")
                  }}
                  placeholder="Cole o hash SHA-256..."
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  autoComplete="off"
                  inputMode="text"
                  aria-label="Hash SHA-256 para abrir no Proof Explorer"
                  className="flex-1 rounded border px-4 py-3 text-sm outline-none placeholder:text-gray-400"
                />

                <button
                  type="submit"
                  className="rounded bg-black px-5 py-3 text-white hover:bg-zinc-800"
                >
                  Abrir proof
                </button>
              </div>

              <p className="text-xs text-gray-500">
                Use esta tela para acessar a visão técnica detalhada da prova.
              </p>
            </form>

            <div className="flex justify-center gap-3 text-sm">
              <button
                type="button"
                onClick={pasteFromClipboard}
                className="text-blue-600 hover:underline"
              >
                Colar
              </button>

              <button
                type="button"
                onClick={useDemo}
                className="text-gray-600 hover:underline"
              >
                Usar demo
              </button>

              <Link
                href="/verify"
                className="text-gray-600 hover:underline"
              >
                Ir para verify
              </Link>
            </div>

            {error ? (
              <p className="text-sm text-red-500" aria-live="polite">
                {error}
              </p>
            ) : null}
          </div>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FeatureCard
              title="Verification Summary"
              description="Validação consolidada de evento, certificado, cadeia e integridade."
            />
            <FeatureCard
              title="Chain & Anchor"
              description="Visualização técnica de cadeia de confiança, erros e âncora blockchain."
            />
            <FeatureCard
              title="Raw JSON"
              description="Inspeção do payload bruto retornado pela API para auditoria aprofundada."
            />
          </section>

          {recentItems.length > 0 ? (
            <div className="mx-auto max-w-2xl space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-500">
                  Proofs recentes
                </h2>

                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-xs text-gray-500 hover:underline"
                >
                  Limpar histórico
                </button>
              </div>

              <div className="space-y-2">
                {recentItems.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setError("")
                      handleOpenProof(item)
                    }}
                    className="block w-full rounded border bg-white p-3 text-left text-xs hover:bg-gray-50"
                  >
                    <div className="font-mono">
                      {item.slice(0, 16)}...{item.slice(-12)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}

function FeatureCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border bg-gray-50 p-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  )
}