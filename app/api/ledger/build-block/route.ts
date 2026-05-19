import { createBlock } from "@/lib/ledger/createBlock";

export async function POST() {

  const block = await createBlock();

  return Response.json(block);

}