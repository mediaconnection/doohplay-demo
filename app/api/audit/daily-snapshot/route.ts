import { NextResponse } from "next/server";
import { generateDailySnapshot } from "@/core/audit/generateDailySnapshot";

export async function POST(req: Request) {

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