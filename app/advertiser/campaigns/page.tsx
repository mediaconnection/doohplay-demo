async function getCampaigns() {

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/campaigns`,
    { cache: "no-store" }
  )

  return res.json()
}

export default async function CampaignsPage() {

  const campaigns = await getCampaigns()

  return (

    <div className="p-10">

      <h1 className="text-2xl font-bold mb-6">
        Campaigns
      </h1>

      <table className="w-full border">

        <thead>

          <tr className="bg-gray-100">

            <th className="p-2">Name</th>
            <th className="p-2">Budget</th>
            <th className="p-2">Start</th>
            <th className="p-2">End</th>

          </tr>

        </thead>

        <tbody>

          {campaigns.map((c: any) => (

            <tr key={c.id} className="border-t">

              <td className="p-2">
                {c.name}
              </td>

              <td className="p-2">
                {c.budget}
              </td>

              <td className="p-2">
                {c.start_date}
              </td>

              <td className="p-2">
                {c.end_date}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )

}