// @ts-nocheck
export type DailyMerkleResult = {
  date: string
  merkle_root: string
  event_count: number
}

export async function buildDailyMerkle(
  _date?: string
): Promise<DailyMerkleResult> {
  throw new Error("buildDailyMerkle: not implemented")
}

