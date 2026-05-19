import Link from "next/link"

export default function VerifyNotFoundPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
            DOOHPLAY Verify Enterprise
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Evidência não encontrada
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
            O hash consultado não foi localizado no ledger verificável do
            DOOHPLAY. Isso pode indicar que o identificador está incorreto,
            incompleto, ainda não foi processado pelo fluxo de prova ou não
            está disponível na base atualmente consultada.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <InfoCard
              title="Verifique o hash"
              text="Confirme se o valor possui 64 caracteres hexadecimais e se não houve erro de cópia."
            />
            <InfoCard
              title="Revise o contexto"
              text="Certifique-se de que o evento pertence ao ambiente, fluxo e base corretos."
            />
            <InfoCard
              title="Tente novamente"
              text="Caso o evento tenha sido gerado recentemente, aguarde o processamento e repita a consulta."
            />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/verify"
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
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