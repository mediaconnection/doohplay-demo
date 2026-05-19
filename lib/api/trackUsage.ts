import { pool } from "@/lib/db"

export async function trackUsage(apiKey: string, endpoint: string) {
  try {
    await pool.query(
      `
      INSERT INTO api_usage (api_key, endpoint)
      VALUES ($1, $2)
      `,
      [apiKey, endpoint]
    )
  } catch (e) {
    console.error("USAGE TRACK ERROR", e)
  }
}