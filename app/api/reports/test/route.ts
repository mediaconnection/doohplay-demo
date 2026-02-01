import { NextResponse } from "next/server";
import { generateReportPdf } from "@/services/pdf/generateReportPdf";
import { generatePdfHash } from "@/services/pdf/generatePdfHash";

export async function GET() {
  try {
    const pdfBuffer = await generateReportPdf();

    const pdfHash = generatePdfHash(pdfBuffer);

    return NextResponse.json({
      step: "pdf + hash generated",
      pdfSize: pdfBuffer.length,
      hash: pdfHash,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
