async function getOverview() {

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/transparency/overview`,
    { cache: "no-store" }
  )

  return res.json()
}

export default async function TransparencyPage() {

  const data = await getOverview()

  return (

    <div className="max-w-6xl mx-auto p-10">

      <h1 className="text-4xl font-bold mb-10">
        DOOH Transparency Explorer
      </h1>

      <div className="grid grid-cols-3 gap-6 mb-12">

        <Stat label="Screens" value={data.screens} />
        <Stat label="Campaigns" value={data.campaigns} />
        <Stat label="Impressions" value={data.impressions} />
        <Stat label="Anchored Impressions" value={data.anchored_impressions} />
        <Stat label="Average Trust Score" value={data.avg_trust_score} />

      </div>

      <Section
        title="Top Screens by Reputation"
        rows={data.top_screens}
      />

      <Section
        title="Top Campaigns by Trust"
        rows={data.top_campaigns}
      />

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

function Section({ title, rows }: any) {

  return (

    <div className="mb-10">

      <h2 className="text-xl font-semibold mb-4">
        {title}
      </h2>

      <table className="w-full border">

        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Entity</th>
            <th className="p-2 text-left">Score</th>
          </tr>
        </thead>

        <tbody>

          {rows.map((r: any) => (

            <tr key={r.entity_id} className="border-t">

              <td className="p-2">
                {r.entity_id}
              </td>

              <td className="p-2">
                {r.reputation_score ?? r.score}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )

}