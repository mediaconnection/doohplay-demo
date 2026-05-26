export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server"

export async function POST(){
    const { buildDailyMerkle } = await import("@/lib/ledger/buildDailyMerkle")


 const day = new Date().toISOString().slice(0,10)

 const root = await buildDailyMerkle(day)

 return NextResponse.json({
  day,
  merkle_root: root
 })
}

