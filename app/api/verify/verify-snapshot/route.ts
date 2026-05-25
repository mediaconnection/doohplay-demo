export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyPdfSignature } from "@/lib/verifyPdfSignature";
import { verifyTimestampToken } from "@/lib/verifyTimestamp";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { snapshot_id, hash } = await req.json();

    if (!snapshot_id || !hash) {
      return NextResponse.json(
        { valid: false, error: "PARAMETERS_REQUIRED" },
        { status: 400 }
      );
    }

    /**
     * 1️⃣ Snapshot + certificação
     */
    const { data, error } = await supabase
      .from("digital_certifications")
      .select(`
        snapshot_id,
        signed_pdf,
        pdf_hash,
        timestamp_token,
        certificate_authority,
        timestamped_at
      `)
      .eq("snapshot_id", snapshot_id)
      .single();

    if (error || !data) {
      return NextResponse.json({
        valid: false,
        reason: "CERTIFICATION_NOT_FOUND"
      });
    }

    /**
     * 2️⃣ Hash confere?
     */
    if (data.pdf_hash !== hash) {
      return NextResponse.json({
        valid: false,
        reason: "HASH_MISMATCH"
      });
    }

    /**
     * 3️⃣ Valida assinatura A1
     */
    const pdfBuffer = Buffer.from(data.signed_pdf, "base64");

    const signature = await verifyPdfSignature(pdfBuffer);

    if (!signature.valid) {
      return NextResponse.json({
        valid: false,
        reason: "INVALID_DIGITAL_SIGNATURE"
      });
    }

    /**
     * 4️⃣ Valida TSA
     */
    const tsaValid = await verifyTimestampToken(
      data.timestamp_token
    );

    if (!tsaValid) {
      return NextResponse.json({
        valid: false,
        reason: "INVALID_TIMESTAMP"
      });
    }

    /**
     * 5️⃣ Veredito final
     */
    return NextResponse.json({
      valid: true,

      integrity: {
        hash_algorithm: "SHA-256",
        hash,
        signed: true,
        timestamped: true,
        verified_at: new Date().toISOString()
      },

      signature: {
        authority: data.certificate_authority,
        signer_verified: true
      },

      timestamp: {
        provider: "RFC 3161",
        timestamped_at: data.timestamped_at
      },

      legal: {
        non_repudiation: true,
        probative_value: "HIGH",
        legal_basis: [
          "MP 2.200-2/2001 (ICP-Brasil)",
          "RFC 3161",
          "Código Civil arts. 369 e 422",
          "ISO/IEC 27001",
          "ISO/IEC 27037"
        ]
      }
    });

  } catch (err) {
    console.error("VERIFY FULL ERROR", err);
    return NextResponse.json(
      { valid: false, error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

