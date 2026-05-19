async function getStats() {

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/operator/stats`,
    { cache: "no-store" }
  )

  if (!res.ok) {
    throw new Error("Failed to load operator stats")
  }

  return res.json()
}

export default async function OperatorDashboard() {

  const stats = await getStats()

  return (

    <div className="p-10 max-w-6xl mx-auto">

      <h1 className="text-3xl font-bold mb-8">
        Screen Operator Console
      </h1>

      <div className="grid grid-cols-4 gap-6">

        <Stat
          label="Screens"
          value={stats.screens}
        />

        <Stat
          label="Impressions"
          value={stats.impressions}
        />

        <Stat
          label="Verified Proofs"
          value={stats.proofs}
        />

        <Stat
          label="Revenue"
          value={`$${stats.revenue}`}
        />

      </div>

    </div>

  )

}

function Stat({ label, value }: any) {

  return (
    <div className="border rounded p-5">

      <div className="text-sm text-gray-500">
        {label}
      </div>

      <div className="text-2xl font-bold">
        {value}
      </div>

    </div>
  )

}