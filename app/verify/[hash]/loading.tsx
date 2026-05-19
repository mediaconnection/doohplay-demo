export default function VerifyHashLoadingPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* BACK LINK */}
        <div className="mb-4">
          <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
        </div>

        {/* HEADER */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-full max-w-md animate-pulse rounded bg-slate-200" />
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="h-9 w-24 animate-pulse rounded-full bg-slate-200" />
              <div className="h-9 w-24 animate-pulse rounded-full bg-slate-200" />
              <div className="h-9 w-24 animate-pulse rounded-full bg-slate-200" />
            </div>
          </div>

          {/* HASH + SCORE */}
          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="rounded-2xl bg-slate-950 p-4">
              <div className="h-3 w-24 animate-pulse rounded bg-slate-700" />
              <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-700" />
              <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-700" />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-8 w-24 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-3 w-28 animate-pulse rounded bg-slate-200" />
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <div className="h-4 w-full max-w-3xl animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-slate-200" />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <div className="h-10 w-36 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-10 w-40 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-10 w-32 animate-pulse rounded-xl bg-slate-200" />
          </div>
        </section>

        {/* ENTERPRISE BLOCKS */}
        <div className="mt-6 space-y-6">
          <LoadingTrustScoreSection />
          <LoadingExplanationSection />
          <LoadingMatrixSection />
          <LoadingLayersSection />
          <LoadingMetadataSection />
        </div>
      </div>
    </main>
  )
}

function LoadingTrustScoreSection() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-full max-w-md animate-pulse rounded bg-slate-200" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
          <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-8 w-24 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-3 w-16 animate-pulse rounded bg-slate-200" />
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-slate-200" />
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <LoadingListCard />
        <LoadingListCard />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <LoadingDomainCard />
        <LoadingDomainCard />
        <LoadingDomainCard />
      </div>
    </section>
  )
}

function LoadingExplanationSection() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="h-5 w-44 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-full max-w-md animate-pulse rounded bg-slate-200" />
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5 lg:min-w-[420px]">
          <LoadingMetric />
          <LoadingMetric />
          <LoadingMetric />
          <LoadingMetric />
          <LoadingMetric />
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-11/12 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-8/12 animate-pulse rounded bg-slate-200" />
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <LoadingListCard />
        <LoadingListCard />
      </div>
    </section>
  )
}

function LoadingMatrixSection() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 space-y-2">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full max-w-md animate-pulse rounded bg-slate-200" />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
      </div>
    </section>
  )
}

function LoadingLayersSection() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 space-y-2">
        <div className="h-5 w-36 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full max-w-md animate-pulse rounded bg-slate-200" />
      </div>

      <div className="space-y-4">
        <LoadingLayerCard />
        <LoadingLayerCard />
        <LoadingLayerCard />
      </div>
    </section>
  )
}

function LoadingMetadataSection() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 space-y-2">
        <div className="h-5 w-44 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full max-w-md animate-pulse rounded bg-slate-200" />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
      </div>
    </section>
  )
}

function LoadingMetric() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
      <div className="h-3 w-14 animate-pulse rounded bg-slate-200" />
      <div className="mt-2 h-4 w-20 animate-pulse rounded bg-slate-200" />
    </div>
  )
}

function LoadingListCard() {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-11/12 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-9/12 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  )
}

function LoadingDomainCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-14 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="h-7 w-20 animate-pulse rounded-full bg-slate-200" />
      </div>

      <div className="mt-4 h-8 w-20 animate-pulse rounded bg-slate-200" />

      <div className="mt-4 space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-10/12 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-8/12 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  )
}

function LoadingLayerCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
          </div>

          <div className="mt-3 h-5 w-44 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 space-y-2">
            <div className="h-3 w-full max-w-xl animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-10/12 animate-pulse rounded bg-slate-200" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="h-7 w-24 animate-pulse rounded-full bg-slate-200" />
          <div className="h-7 w-16 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <LoadingCard />
        <LoadingCard />
      </div>
    </div>
  )
}

function LoadingCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  )
}