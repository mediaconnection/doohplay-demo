import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const publicKey = fs.readFileSync(
      path.join(process.cwd(), "public.pem"),
      "utf8"
    )

    return NextResponse.json({
      public_key: publicKey
    })

  } catch (err) {
    console.error("❌ Failed to load public key:", err)

    return NextResponse.json(
      { error: "Failed to load public key" },
      { status: 500 }
    )
  }
}