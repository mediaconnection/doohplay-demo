import { NextResponse } from "next/server";
import { timestampMerkleRoot } from "@/core/audit/timestampProof";
import { generateProof } from "@/core/audit/generateProof";

export async function GET() {

  const proof = await generateProof();

  const timestamp = await timestampMerkleRoot(
    proof.merkle_root
  );

  return NextResponse.json({
    ...proof,
    timestamp
  });

}