type Input = {
  timestamps: string[]
  hashes: string[]
  prevHashes: string[]
}

export function detectAnomalies(input: Input) {
  const issues: string[] = []

  const times = input.timestamps.map(t => new Date(t).getTime())

  /* =========================
     1. TIMESTAMP ORDER
  ========================= */

  for (let i = 1; i < times.length; i++) {
    if (times[i] < times[i - 1]) {
      issues.push("Timestamp out of order")
      break
    }
  }

  /* =========================
     2. DUPLICATED HASH
  ========================= */

  const uniqueHashes = new Set(input.hashes)
  if (uniqueHashes.size !== input.hashes.length) {
    issues.push("Duplicate event hash detected")
  }

  /* =========================
     3. BURST DETECTION
  ========================= */

  let burstCount = 0

  for (let i = 1; i < times.length; i++) {
    const diff = times[i] - times[i - 1]

    if (diff < 1000) {
      burstCount++
    }
  }

  if (burstCount > 5) {
    issues.push("Abnormal event burst detected")
  }

  /* =========================
     4. BROKEN CHAIN LINKS
  ========================= */

  for (let i = 1; i < input.hashes.length; i++) {
    if (input.prevHashes[i] !== input.hashes[i - 1]) {
      issues.push("Broken prev_hash linkage")
      break
    }
  }

  return {
    hasIssues: issues.length > 0,
    issues
  }
}