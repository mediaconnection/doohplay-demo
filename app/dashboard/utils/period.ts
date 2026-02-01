export function getPeriodRange(period: "today" | "7d" | "30d") {
  const end = new Date();
  const start = new Date();

  if (period === "today") {
    start.setHours(0, 0, 0, 0);
  }

  if (period === "7d") {
    start.setDate(end.getDate() - 7);
  }

  if (period === "30d") {
    start.setDate(end.getDate() - 30);
  }

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}
