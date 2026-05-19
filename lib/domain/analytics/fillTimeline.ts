export function fillMissingDays(
  data: { date: string; trust: number | null; events: number }[],
  days = 30
) {
  const map = new Map(data.map(d => [d.date, d]))

  const result = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)

    const date = d.toISOString().slice(0, 10)

    result.push(
      map.get(date) || {
        date,
        trust: null,
        events: 0,
      }
    )
  }

  return result
}