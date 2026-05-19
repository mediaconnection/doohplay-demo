async function getScreens() {

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/screens`,
    { cache: "no-store" }
  )

  return res.json()
}

export default async function ScreensMap() {

  const screens = await getScreens()

  return (

    <div className="p-10">

      <h1 className="text-3xl font-bold mb-8">
        Global Screen Registry
      </h1>

      <table className="w-full border">

        <thead>

          <tr className="bg-gray-100">

            <th className="p-3">Screen</th>
            <th className="p-3">City</th>
            <th className="p-3">Impressions</th>
            <th className="p-3">Trust Score</th>

          </tr>

        </thead>

        <tbody>

          {screens.map((s: any) => (

            <tr key={s.id} className="border-t">

              <td className="p-3">
                {s.name}
              </td>

              <td className="p-3">
                {s.city}
              </td>

              <td className="p-3">
                {s.impressions || 0}
              </td>

              <td className="p-3">
                {s.trust_score || 0}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )

}