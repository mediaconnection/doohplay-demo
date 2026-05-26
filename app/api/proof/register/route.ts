export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server"

const { generateReport } = require("@/reports/generateReport")
const { signReport } = require("@/reports/signReport")

export async function POST(req: Request) {

  try {

    const body = await req.json()

    const report = await generateReport({
      campaign: body.campaign,
      player: body.player,
      location: body.location,
      views: body.views,
      period: body.period
    })

    const signed = await signReport(report.filePath)

    return NextResponse.json({
      success: true,
      hash: report.hash,
      pdf: signed
    })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      { error: "Erro ao gerar prova" },
      { status: 500 }
    )

  }

}

