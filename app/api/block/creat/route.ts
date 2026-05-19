import { NextResponse } from "next/server"
import { createBlock } from "@/lib/domain/block/createBlock"

export async function GET() {
  try {
    const result = await createBlock()

    return NextResponse.json({
      success: true,
      result
    })
  } catch (err) {
    console.error(err)

    return NextResponse.json(
      { error: "Failed to create block" },
      { status: 500 }
    )
  }
}