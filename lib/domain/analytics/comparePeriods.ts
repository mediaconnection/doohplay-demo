// @ts-nocheck
export function comparePeriods(
  current: number[],
  previous: number[]
) {
  const avg = (arr: number[]) =>
    arr.length
      ? arr.reduce((a, b) => a + b, 0) / arr.length
      : 0

  const currentAvg = avg(current)
  const previousAvg = avg(previous)

  const delta = currentAvg - previousAvg

  let direction: "up" | "down" | "stable" = "stable"

  if (delta > 5) direction = "up"
  else if (delta < -5) direction = "down"

  return {
    current_avg: Math.round(currentAvg),
    previous_avg: Math.round(previousAvg),
    delta: Math.round(delta),
    direction,
  }
}
