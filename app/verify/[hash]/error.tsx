"use client"

type VerifyHashErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function VerifyHashError({
  error,
  reset
}: VerifyHashErrorProps) {
  console.error("[verify][page] error boundary", error)

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-rose-200 bg-white p-8 shadow-sm">
          <div className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
            Verification Error
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            Não foi possível carregar a verificação
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Ocorreu um erro ao montar a página pública de prova. Isso pode ter
            sido causado por instabilidade temporária, erro de integração com a
            API de verificação ou falha na leitura dos dados do ledger.
          </p>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Detalhe técnico
            </div>
            <code className="mt-2 block break-all text-xs text-slate-700">
              {error?.message || "Unexpected verification error"}
            </code>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Tentar novamente
            </button>

            <a
              href="/verify"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Voltar para verificar
            </a>

            <a
              href="/"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Ir para o portal
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}