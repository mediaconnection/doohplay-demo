import { NextResponse } from "next/server";
import { verifyEventChain } from "@/core/audit/verifyEventChain";

export async function GET() {
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