export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { generateDailySnapshot } = await import("@/core/audit/generateDailySnapshot")


  try {

    const body = await req.json();
    const { date } = body;

    const snapshot = await generateDailySnapshot(date);

    return NextResponse.json(snapshot);

  } catch (err: any) {

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );

  }

}

