function adjustScoreWithHistory(score: number, history: any[]) {
  if (!history.length) return score

  const failures = history.filter(h => h.status === "FAILED").length

  if (failures >= 3) {
    score -= 15
  }

  return Math.max(0, score)
}