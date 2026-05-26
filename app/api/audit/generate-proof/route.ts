export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server";
import { generateProof } from "@/core/audit/generateProof";

export async function GET() {

  try {

    const proof = await generateProof();

    return NextResponse.json(proof);

  } catch (err) {

    console.error("❌ PROOF GENERATION FAILED", err);

    return NextResponse.json(
      { error: "proof generation failed" },
      { status: 500 }
    );

  }

}

