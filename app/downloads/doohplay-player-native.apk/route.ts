import { NextResponse } from "next/server"
import { existsSync } from "fs"
import { readFile } from "fs/promises"
import path from "path"

export const dynamic = "force-dynamic"

export async function GET() {
  const candidates = [
    path.join(process.cwd(), "public", "downloads", "doohplay-player-native.apk"),
    path.join(process.cwd(), ".next", "standalone", "public", "downloads", "doohplay-player-native.apk"),
  ]

  const apkPath = candidates.find((candidate) => existsSync(candidate))

  if (!apkPath) {
    return NextResponse.json(
      { error: "APK nao encontrado no servidor" },
      { status: 404 },
    )
  }

  const file = await readFile(apkPath)

  return new NextResponse(new Uint8Array(file), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Disposition": 'attachment; filename="doohplay-player-native.apk"',
      "Cache-Control": "no-store",
    },
  })
}
