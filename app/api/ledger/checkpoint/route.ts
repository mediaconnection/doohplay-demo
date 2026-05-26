export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { createCheckpoint } from "@/lib/ledger/createCheckpoint"
import { NextResponse } from "next/server"

export async function POST(){

 const hash = await createCheckpoint()

 return NextResponse.json({
  checkpoint:hash
 })
}

