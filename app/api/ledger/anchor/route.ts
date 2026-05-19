import {
  getLatestBlock,
  storeLedgerAnchor
} from "@/lib/services/ledgerAnchorService";

export async function POST() {

  const block = await getLatestBlock();

  if (!block) {

    return Response.json({
      error: "No blocks found"
    }, { status: 404 });

  }

  /* 
     Aqui você integraria com
     Ethereum / Arweave / etc
  */

  const fakeTxHash =
    "demo-anchor-" + Date.now();

  await storeLedgerAnchor(
    block.block_height,
    block.block_hash,
    "demo-network",
    fakeTxHash
  );

  return Response.json({

    anchored: true,
    block_height: block.block_height,
    block_hash: block.block_hash,
    tx_hash: fakeTxHash

  });

}