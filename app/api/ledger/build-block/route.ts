export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0


export async function POST() {
    const { createBlock } = await import("@/lib/ledger/createBlock")


  const block = await createBlock();

  return Response.json(block);

}

