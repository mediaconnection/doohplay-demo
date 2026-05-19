async function getStats() {

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/advertiser/stats`,
    { cache: "no-store" }
  )

  return res.json()
}

export default async function AdvertiserDashboard() {

  const stats = await getStats()

  return (

    <div className="p-10">

      <h1 className="text-3xl font-bold mb-8">
        Advertiser Console
      </h1>

      <div className="grid grid-cols-4 gap-6">

        <Stat label="Campaigns" value={stats.campaigns} />
        <Stat label="Impressions" value={stats.impressions} />
        <Stat label="Verified Proofs" value={stats.proofs} />
        <Stat label="Trust Score Avg" value={stats.trust} />

      </div>

    </div>

  )

}

function Stat({ label, value }: any) {

  return (
    <div className="border rounded p-4">

      <div className="text-sm text-gray-500">
        {label}
      </div>

      <div className="text-2xl font-bold">
        {value}
      </div>

    </div>
  )

}