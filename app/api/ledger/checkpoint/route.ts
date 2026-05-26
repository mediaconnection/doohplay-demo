export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server"

export async function POST(){
    const { createCheckpoint } = await import("@/lib/ledger/createCheckpoint")


 const hash = await createCheckpoint()

 return NextResponse.json({
  checkpoint:hash
 })
}

