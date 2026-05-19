import Link from "next/link"

export const dynamic = "force-dynamic"

export default function AuditTransparencyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <Link
            href="/audit"
            className="text-sm text-slate-400 hover:text-white"
          >
            ← Voltar ao Audit Portal
          </Link>
        </div>

        <header className="mb-10">
          <p className="mb-3 text-sm uppercase tracking-wide text-blue-400">
            DOOHPLAY Public Transparency
          </p>

          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Public Transparency Report
          </h1>

          <p className="mt-4 max-w-3xl text-slate-300">
            Relatório público de transparência para verificação de eventos,
            campanhas, trilhas criptográficas e evidências auditáveis da rede
            DOOHPLAY.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">Eventos auditáveis</h2>
            <p className="mt-2 text-sm text-slate-400">
              Consulta pública de eventos registrados no ledger criptográfico.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">Provas Merkle</h2>
            <p className="mt-2 text-sm text-slate-400">
              Validação de inclusão, raiz Merkle e consistência de lote.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">Ancoragem blockchain</h2>
            <p className="mt-2 text-sm text-slate-400">
              Evidências de transação, hash, rede e confirmação pública.
            </p>
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Status</h2>
          <p className="mt-2 text-sm text-slate-400">
            Página ativa. Integrações avançadas de métricas públicas podem ser
            conectadas aos endpoints de auditoria conforme o pipeline enterprise
            evoluir.
          </p>
        </section>
      </section>
    </main>
  )
}