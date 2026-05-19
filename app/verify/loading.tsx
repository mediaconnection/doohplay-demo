export default function VerifyLoadingPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="h-6 w-44 animate-pulse rounded-full bg-slate-200" />

          <div className="mt-5 h-10 w-full max-w-2xl animate-pulse rounded-2xl bg-slate-200" />

          <div className="mt-4 space-y-3">
            <div className="h-4 w-full max-w-3xl animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-full max-w-xl animate-pulse rounded bg-slate-200" />
          </div>

          <div className="mt-8 space-y-4">
            <div>
              <div className="mb-2 h-4 w-28 animate-pulse rounded bg-slate-200" />
              <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-200" />
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="h-11 w-40 animate-pulse rounded-2xl bg-slate-200" />
              <div className="h-11 w-28 animate-pulse rounded-2xl bg-slate-200" />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <LoadingCard />
          <LoadingCard />
          <LoadingCard />
        </section>
      </div>
    </main>
  )
}

function LoadingCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-11/12 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-8/12 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  )
}