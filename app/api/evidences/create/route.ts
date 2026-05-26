export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import "@/app/api/_bootstrap";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { createEvidence } = await import("@/services/evidences/createEvidence")

  const body = await req.json();

  const evidence = await createEvidence({
    hash: body.hash,
    type: body.type,
  });

  return NextResponse.json(evidence);
}

