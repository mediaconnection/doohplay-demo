export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server";

export async function GET() {
    const { verifyEventChain } = await import("@/core/audit/verifyEventChain")

  try {
    console.log("🔎 VERIFY-CHAIN API CALLED");

    const result = await verifyEventChain();

    return NextResponse.json(result);

  } catch (error) {
    console.error("❌ verify-chain error", error);

    return NextResponse.json(
      { error: "verification failed" },
      { status: 500 }
    );
  }
}

