import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import React from "react";
import { renderToStream } from "@react-pdf/renderer";
import QRCode from "qrcode";

import DashboardReport from "../../../reports/DashboardReport";
import { streamToBuffer } from "../../../lib/pdfToBuffer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    /* ======================================================
       DADOS DO RELATÓRIO (exemplo)
    ====================================================== */
    const start = "2026-01-01";
    const end = "2026-01-31";

    const kpis = {
      total_executions: 2,
      active_players: 2,
      total_seconds: 60,
      active_campaigns: 1,
    };

    /* ======================================================
       1️⃣ PDF BASE → STREAM → BUFFER REAL
    ====================================================== */
    const unsignedStream = (await renderToStream(
      React.createElement(DashboardReport, {
        start,
        end,
        kpis,
      }) as React.ReactElement<any>
    )) as unknown as NodeJS.ReadableStream;

    const unsignedBuffer = await streamToBuffer(unsignedStream as any);

    /* ======================================================
       2️⃣ HASH SHA-256 (INTEGRIDADE)
    ====================================================== */
    const integrityHash = crypto
      .createHash("sha256")
      .update(unsignedBuffer)
      .digest("hex");

    const signedAt = new Date().toISOString();

    /* ======================================================
       3️⃣ ASSINATURA CRIPTOGRÁFICA (ECDSA)
    ====================================================== */
    const privateKey = process.env.PDF_SIGN_PRIVATE_KEY;

    if (!privateKey) {
      throw new Error("PDF_SIGN_PRIVATE_KEY não configurada");
    }

    const signature = crypto
      .sign(
        "sha256",
        Buffer.from(integrityHash, "utf8"),
        {
          key: privateKey,
          dsaEncoding: "ieee-p1363",
        }
      )
      .toString("base64");

    /* ======================================================
       4️⃣ QR CODE DE VERIFICAÇÃO
    ====================================================== */
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
      "http://localhost:3000";

    const verifyUrl = `${appUrl}/verify/${integrityHash}`;

    let qrCode: string | undefined;
    try {
      qrCode = await QRCode.toDataURL(verifyUrl, {
        errorCorrectionLevel: "H",
        width: 200,
        margin: 1,
      });
    } catch (err) {
      console.warn("Falha ao gerar QR Code:", err);
    }

    /* ======================================================
       5️⃣ PDF FINAL ASSINADO
    ====================================================== */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signedStream = (await (renderToStream as any)(
      React.createElement(DashboardReport, {
        start, end, kpis, integrityHash, signedAt, signature, qrCode,
      } as any)
    )) as NodeJS.ReadableStream;

    const signedBuffer = await streamToBuffer(signedStream as any);

    /* ======================================================
       6️⃣ RESPONSE
    ====================================================== */
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'inline; filename="dashboard-signed.pdf"'
    );
    res.setHeader("Cache-Control", "no-store, max-age=0");

    return res.status(200).send(signedBuffer);
  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    return res.status(500).json({
      error: "Failed to generate PDF",
    });
  }
}
