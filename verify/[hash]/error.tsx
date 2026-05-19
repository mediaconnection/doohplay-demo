"use client"

import Link from "next/link"
import { useEffect } from "react"

type Props = {
  error: Error & {
    digest?: string
  }
  reset: () => void
}

function getSafeMessage(error: Error | null | undefined): string {
  const message =
    typeof error?.message === "string" ? error.message.trim() : ""

  if (!message) {
    return "Ocorreu uma falha inesperada durante a verificação."
  }

  if (/fetch/i.test(message) || /network/i.test(message)) {
    return "Não foi possível consultar o serviço de verificação no momento."
  }

  if (/timeout/i.test(message)) {
    return "A verificação excedeu o tempo esperado de resposta."
  }

  if (/json/i.test(message)) {
    return "A resposta do serviço de verificação não pôde ser interpretada."
  }

  return "Ocorreu uma falha inesperada durante a verificação."
}

function getTechnicalHint(error: Error | null | undefined): string | null {
  const message =
    typeof error?.message === "string" ? error.message.trim() : ""

  if (!message) return null

  if (/fetch/i.test(message) || /network/i.test(message)) {
    return "Verifique conectividade, base URL pública e disponibilidade da rota /api/verify/[hash]."
  }

  if (/timeout/i.test(message)) {
    return "Revise timeout do engine, latência do banco, cache e disponibilidade das dependências externas."
  }

  if (/json/i.test(message)) {
    return "Verifique se a rota pública está retornando JSON válido e consistente com a tipagem da UI."
  }

  return "Revise logs do servidor, request_id e fluxo da rota pública de verificação."
}

export default function VerifyHashError({ error, reset }: Props) {
  useEffect(() => {
    console.error("VERIFY_HASH_PAGE_ERROR", {
      message: error?.message,
      digest: error?.digest
    })
  }, [error])

  const safeMessage = getSafeMessage(error)
  const technicalHint = getTechnicalHint(error)

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-4">
          <Link
            href="/verify"
            className="text-sm text-slate-500 transition hover:text-slate-900 hover:underline"
          >
            ← Voltar para verificação
          </Link>
        </div>

        <section className="rounded-3xl border border-rose-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Falha na verificação pública
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                A página de verificação encontrou uma falha inesperada durante o processamento.
              </p>
            </div>

            <span className="inline-flex rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white">
              ERROR
            </span>
          </div>

          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5">
            <div className="text-sm font-semibold text-rose-800">
              Resumo executivo
            </div>
            <p className="mt-2 text-sm leading-6 text-rose-700">
              {safeMessage}
            </p>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-semibold text-slate-900">
                Ação recomendada
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Reexecute a consulta. Se a falha persistir, valide a rota pública,
                a resposta JSON e a disponibilidade do engine de prova.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-semibold text-slate-900">
                Observação técnica
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {technicalHint ?? "Consulte os logs do servidor para investigar a origem da falha."}
              </p>

              {error?.digest ? (
                <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">
                    Digest
                  </div>
                  <code className="mt-1 block break-all text-xs text-slate-800">
                    {error.digest}
                  </code>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Tentar novamente
            </button>

            <Link
              href="/verify"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Nova verificação
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}