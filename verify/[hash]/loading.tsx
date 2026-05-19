export default function VerifyHashLoading() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-4">
          <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="h-9 w-72 animate-pulse rounded bg-slate-200" />
              <div className="h-5 w-96 animate-pulse rounded bg-slate-100" />
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="h-10 w-28 animate-pulse rounded-full bg-slate-200" />
              <div className="h-10 w-28 animate-pulse rounded-full bg-slate-200" />
              <div className="h-10 w-28 animate-pulse rounded-full bg-slate-200" />
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="rounded-2xl bg-slate-950 p-4">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-700" />
              <div className="mt-3 h-5 w-full animate-pulse rounded bg-slate-800" />
              <div className="mt-2 h-5 w-4/5 animate-pulse rounded bg-slate-800" />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-8 w-24 animate-pulse rounded bg-slate-300" />
              <div className="mt-3 h-4 w-36 animate-pulse rounded bg-slate-200" />
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-11/12 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-9/12 animate-pulse rounded bg-slate-100" />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <div className="h-10 w-40 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-10 w-44 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-10 w-40 animate-pulse rounded-xl bg-slate-200" />
          </div>
        </section>

        <div className="mt-6 space-y-6">
          <LoadingCard titleWidth="w-56" rows={4} />
          <LoadingCard titleWidth="w-64" rows={3} />
          <LoadingGridCard titleWidth="w-52" items={6} />
          <LoadingCard titleWidth="w-48" rows={5} />
          <LoadingGridCard titleWidth="w-60" items={6} />
        </div>
      </div>
    </main>
  )
}

function LoadingCard({
  titleWidth,
  rows
}: {
  titleWidth: string
  rows: number
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className={`h-6 animate-pulse rounded bg-slate-200 ${titleWidth}`} />
      <div className="mt-2 h-4 w-80 animate-pulse rounded bg-slate-100" />

      <div className="mt-5 space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-100" />
            <div className="mt-2 h-4 w-9/12 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </section>
  )
}

function LoadingGridCard({
  titleWidth,
  items
}: {
  titleWidth: string
  items: number
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className={`h-6 animate-pulse rounded bg-slate-200 ${titleWidth}`} />
      <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-100" />

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: items }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                <div className="mt-2 h-3 w-full animate-pulse rounded bg-slate-100" />
                <div className="mt-2 h-3 w-10/12 animate-pulse rounded bg-slate-100" />
              </div>
              <div className="h-7 w-16 animate-pulse rounded-full bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}