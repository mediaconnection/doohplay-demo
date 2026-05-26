export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0


export async function GET() {
    const { pool } = await import("@/lib/db")


  const res = await pool.query(`
    select
      s.id,
      s.name,
      s.city,
      s.country,
      s.latitude,
      s.longitude,
      s.status,
      ss.impressions,
      ss.verified_impressions,
      ss.trust_score,
      ss.reputation_score
    from screens s
    left join screen_stats ss
      on ss.screen_id = s.id
    order by s.created_at desc
  `)

  return Response.json(res.rows)

}

