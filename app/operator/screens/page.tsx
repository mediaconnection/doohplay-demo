async function getScreens() {

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/screens`,
    { cache: "no-store" }
  )

  return res.json()
}

export default async function ScreensPage() {

  const screens = await getScreens()

  return (

    <div className="p-10">

      <h1 className="text-2xl font-bold mb-6">
        Screens
      </h1>

      <table className="w-full border">

        <thead>

          <tr className="bg-gray-100">

            <th className="p-3">Screen</th>
            <th className="p-3">Location</th>
            <th className="p-3">Status</th>

          </tr>

        </thead>

        <tbody>

          {screens.map((s: any) => (

            <tr key={s.id} className="border-t">

              <td className="p-3">
                {s.name}
              </td>

              <td className="p-3">
                {s.location}
              </td>

              <td className="p-3">
                {s.status}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )

}