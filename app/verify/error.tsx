"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function VerifyErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[VERIFY ERROR PAGE]", error)
  }, [error])

  const errorMessage =
    typeof error?.message === "string" && error.message.trim().length > 0
      ? error.message
      : "Sem mensagem de erro"

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-rose-200 bg-white p-6 shadow-sm md:p-8">
          <div className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-700">
            DOOHPLAY Verify Enterprise
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Erro na verificação
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
            Ocorreu uma falha ao processar a verificação do evento. Isso pode
            estar relacionado a indisponibilidade temporária do serviço,
            inconsistência de dados ou erro interno não previsto.
          </p>

          {process.env.NODE_ENV !== "production" ? (
            <div
              role="alert"
              aria-live="assertive"
              className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800"
            >
              <div className="mb-1 font-semibold">Debug:</div>
              <div className="break-all">{errorMessage}</div>

              {error?.digest ? (
                <div className="mt-1 opacity-70">
                  digest: {error.digest}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Tentar novamente
            </button>

            <Link
              href="/verify"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Nova verificação
            </Link>

            <Link
              href="/"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Voltar ao início
            </Link>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <InfoCard
            title="Instabilidade"
            text="O serviço de verificação pode estar temporariamente indisponível."
          />
          <InfoCard
            title="Dados inconsistentes"
            text="Pode haver inconsistência entre o evento e as evidências associadas."
          />
          <InfoCard
            title="Erro interno"
            text="Falha inesperada durante o processamento da verificação enterprise."
          />
        </section>
      </div>
    </main>
  )
}

function InfoCard({
  title,
  text
}: {
  title: string
  text: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  )
}