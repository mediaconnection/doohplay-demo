export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server"
import { buildDailyMerkle } from "@/lib/ledger/buildDailyMerkle"

export async function POST(){

 const day = new Date().toISOString().slice(0,10)

 const root = await buildDailyMerkle(day)

 return NextResponse.json({
  day,
  merkle_root: root
 })
}
