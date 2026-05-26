export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { createBlock } from "@/lib/ledger/createBlock";

export async function POST() {

  const block = await createBlock();

  return Response.json(block);

}

