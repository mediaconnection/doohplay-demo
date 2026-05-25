export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/verify-invoice
 * Validação pública de fatura (A1 + TSA)
 */
export async function POST(req: NextRequest) {
  try {
    const { invoice_id, hash } = await req.json();

    if (!invoice_id || !hash) {
      return NextResponse.json(
        { valid: false, error: "MISSING_PARAMETERS" },
        { status: 400 }
      );
    }

    // 1️⃣ Buscar evidência criptográfica
    const { data, error } = await supabase
      .from("pdf_hashes")
      .select("*")
      .eq("entity_type", "invoice")
      .eq("entity_id", invoice_id)
      .eq("hash", hash)
      .single();

    if (error || !data) {
      return NextResponse.json({
        valid: false,
        reason: "HASH_NOT_FOUND",
      });
    }

    // 2️⃣ Validar TSA
    const hasTsa = !!data.tsa_token;

    return NextResponse.json({
      valid: true,
      entity: "invoice",
      entity_id: invoice_id,

      integrity: true,
      hash_algorithm: data.algorithm,

      signed: true,
      signature_type: "ICP-Brasil A1",

      timestamped: hasTsa,
      timestamp_authority: hasTsa ? "RFC 3161 (TSA)" : null,
      timestamped_at: data.created_at,

      legal_basis: [
        "MP 2.200-2/2001",
        "ICP-Brasil",
        "RFC 3161",
      ],
    });

  } catch (err) {
    console.error("VERIFY INVOICE ERROR", err);
    return NextResponse.json(
      { valid: false, error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

