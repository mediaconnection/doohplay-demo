export const dynamic = 'force-dynamic';
import "@/app/api/_bootstrap";

import { NextRequest, NextResponse } from "next/server";
import { createEvidence } from "@/services/evidences/createEvidence";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const evidence = await createEvidence({
    hash: body.hash,
    type: body.type,
  });

  return NextResponse.json(evidence);
}
